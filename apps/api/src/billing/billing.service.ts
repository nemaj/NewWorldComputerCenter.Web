import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCustomerInput, CreatePlanInput, UpdateCustomerInput, UpdatePlanInput } from './models';
import { Customer } from './schemas/customer.schema';
import { Invoice } from './schemas/invoice.schema';
import { Payment } from './schemas/payment.schema';
import { Plan } from './schemas/plan.schema';
import { Subscription } from './schemas/subscription.schema';

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(
    @InjectModel(Customer.name) private readonly customers: Model<Customer>,
    @InjectModel(Plan.name) private readonly plans: Model<Plan>,
    @InjectModel(Subscription.name) private readonly subscriptions: Model<Subscription>,
    @InjectModel(Invoice.name) private readonly invoices: Model<Invoice>,
    @InjectModel(Payment.name) private readonly payments: Model<Payment>
  ) {}

  async onModuleInit() {
    await this.dropStaleCustomerIndexes();
  }

  customersList() {
    return this.customers.find().sort({ createdAt: -1 });
  }

  async customer(id: string) {
    const customer = await this.customers.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  plansList() {
    return this.plans.find().sort({ monthlyPrice: 1 });
  }

  async plan(id: string) {
    const plan = await this.plans.findById(id);

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  subscriptionsList() {
    return this.subscriptions.find().populate('customer').populate('plan').sort({ createdAt: -1 });
  }

  invoicesList() {
    return this.invoices
      .find()
      .populate('customer')
      .populate('plan')
      .populate({ path: 'subscription', populate: ['customer', 'plan'] })
      .sort({ createdAt: -1 });
  }

  paymentsList() {
    return this.payments
      .find()
      .populate('customer')
      .populate({ path: 'invoice', populate: ['customer', 'plan', { path: 'subscription', populate: ['customer', 'plan'] }] })
      .sort({ paidAt: -1 });
  }

  async dashboardStats() {
    const [paidInvoices, unpaidInvoices, activeSubscriptions, paymentRows] = await Promise.all([
      this.invoices.countDocuments({ status: 'PAID' }),
      this.invoices.countDocuments({ status: 'UNPAID' }),
      this.subscriptions.countDocuments({ status: 'ACTIVE' }),
      this.payments.find().select('amount')
    ]);

    return {
      totalRevenue: paymentRows.reduce((sum, payment) => sum + payment.amount, 0),
      paidInvoices,
      unpaidInvoices,
      activeSubscriptions
    };
  }

  createCustomer(input: CreateCustomerInput) {
    return this.customers.create(input);
  }

  async updateCustomer(id: string, input: UpdateCustomerInput) {
    const customer = await this.customers.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  createPlan(input: CreatePlanInput) {
    return this.plans.create(input);
  }

  async updatePlan(id: string, input: UpdatePlanInput) {
    const plan = await this.plans.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async createSubscription(customerId: string, planId: string, startDate: Date) {
    const [customer, plan] = await Promise.all([
      this.customers.findById(customerId),
      this.plans.findById(planId)
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!plan) throw new NotFoundException('Plan not found');

    const existingSubscription = await this.subscriptions.findOne({
      customer: new Types.ObjectId(customerId)
    });

    if (existingSubscription) {
      throw new ConflictException('Customer already has a subscription');
    }

    return this.subscriptions.create({
      customer: new Types.ObjectId(customerId),
      plan: new Types.ObjectId(planId),
      startDate,
      status: 'ACTIVE'
    });
  }

  async generateMonthlyInvoices(billingMonth: string) {
    const activeSubscriptions = await this.subscriptions.find({ status: 'ACTIVE' }).populate('plan');
    const created = [];

    for (const subscription of activeSubscriptions) {
      if (!this.canInvoiceSubscription(subscription.startDate, billingMonth)) {
        continue;
      }

      const plan = subscription.plan as unknown as Plan & { _id: Types.ObjectId };
      const dueDate = this.getDueDate(billingMonth, subscription.startDate);
      const existing = await this.invoices.findOne({
        subscription: subscription._id,
        billingMonth
      });

      if (existing) {
        continue;
      }

      created.push(
        await this.invoices.create({
          customer: subscription.customer,
          plan: plan._id,
          subscription: subscription._id,
          billingMonth,
          dueDate,
          amount: plan.monthlyPrice,
          paidAmount: 0,
          balance: plan.monthlyPrice,
          status: 'UNPAID'
        })
      );
    }

    return this.invoices
      .find({ _id: { $in: created.map((invoice) => invoice._id) } })
      .populate('customer')
      .populate('plan')
      .populate({ path: 'subscription', populate: ['customer', 'plan'] });
  }

  async recordPayment(invoiceId: string, amount: number, paidAt: Date) {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const invoice = await this.invoices.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'VOID') {
      throw new BadRequestException('Cannot record payment for a void invoice');
    }

    const olderUnpaidInvoice = await this.invoices.findOne({
      customer: invoice.customer,
      _id: { $ne: invoice._id },
      status: 'UNPAID',
      balance: { $gt: 0 },
      $or: [
        { billingMonth: { $lt: invoice.billingMonth } },
        { billingMonth: invoice.billingMonth, dueDate: { $lt: invoice.dueDate } }
      ]
    });

    if (olderUnpaidInvoice) {
      throw new BadRequestException('Pay older unpaid invoices before paying this invoice');
    }

    const paidAmount = invoice.paidAmount ?? 0;
    const balance = invoice.balance ?? Math.max(invoice.amount - paidAmount, 0);

    if (amount > balance) {
      throw new BadRequestException('Payment amount cannot exceed invoice balance');
    }

    await this.payments.create({
      invoice: invoice._id,
      customer: invoice.customer,
      amount,
      paidAt
    });

    const nextPaidAmount = paidAmount + amount;
    const nextBalance = Math.max(invoice.amount - nextPaidAmount, 0);

    return this.invoices
      .findByIdAndUpdate(
        invoiceId,
        {
          paidAmount: nextPaidAmount,
          balance: nextBalance,
          status: nextBalance === 0 ? 'PAID' : 'UNPAID',
          paidAt: nextBalance === 0 ? paidAt : undefined
        },
        { new: true }
      )
      .populate('customer')
      .populate('plan')
      .populate({ path: 'subscription', populate: ['customer', 'plan'] });
  }

  private canInvoiceSubscription(startDate: Date, billingMonth: string) {
    const firstBillableMonth = this.addMonths(this.monthStart(startDate), 1);
    const invoiceMonth = this.parseBillingMonth(billingMonth);

    return invoiceMonth >= firstBillableMonth;
  }

  private getDueDate(billingMonth: string, subscriptionStartDate: Date) {
    const [year, month] = billingMonth.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const dueDay = Math.min(subscriptionStartDate.getUTCDate(), lastDay);

    return new Date(Date.UTC(year, month - 1, dueDay));
  }

  private monthStart(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
  }

  private addMonths(value: Date, months: number) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + months, 1));
  }

  private parseBillingMonth(billingMonth: string) {
    const [year, month] = billingMonth.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1));
  }

  private async dropStaleCustomerIndexes() {
    const staleIndexName = 'email_1';

    if (await this.customers.collection.indexExists(staleIndexName)) {
      await this.customers.collection.dropIndex(staleIndexName);
    }
  }
}
