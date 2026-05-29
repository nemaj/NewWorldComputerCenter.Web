import { Args, Float, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BillingService } from './billing.service';
import {
  CreateCustomerInput,
  CreatePlanInput,
  CustomerModel,
  DashboardStatsModel,
  InvoiceModel,
  PaymentModel,
  PlanModel,
  SubscriptionModel,
  UpdateCustomerInput,
  UpdatePlanInput
} from './models';

@Resolver()
export class BillingResolver {
  constructor(private readonly billing: BillingService) {}

  @Query(() => [CustomerModel])
  customers() {
    return this.billing.customersList();
  }

  @Query(() => CustomerModel)
  customer(@Args('id') id: string) {
    return this.billing.customer(id);
  }

  @Query(() => [PlanModel])
  plans() {
    return this.billing.plansList();
  }

  @Query(() => PlanModel)
  plan(@Args('id') id: string) {
    return this.billing.plan(id);
  }

  @Query(() => [SubscriptionModel])
  subscriptions() {
    return this.billing.subscriptionsList();
  }

  @Query(() => [InvoiceModel])
  invoices() {
    return this.billing.invoicesList();
  }

  @Query(() => [PaymentModel])
  payments() {
    return this.billing.paymentsList();
  }

  @Query(() => DashboardStatsModel)
  dashboardStats() {
    return this.billing.dashboardStats();
  }

  @Mutation(() => CustomerModel)
  createCustomer(@Args('input') input: CreateCustomerInput) {
    return this.billing.createCustomer(input);
  }

  @Mutation(() => CustomerModel)
  updateCustomer(@Args('id') id: string, @Args('input') input: UpdateCustomerInput) {
    return this.billing.updateCustomer(id, input);
  }

  @Mutation(() => PlanModel)
  createPlan(@Args('input') input: CreatePlanInput) {
    return this.billing.createPlan(input);
  }

  @Mutation(() => PlanModel)
  updatePlan(@Args('id') id: string, @Args('input') input: UpdatePlanInput) {
    return this.billing.updatePlan(id, input);
  }

  @Mutation(() => SubscriptionModel)
  createSubscription(
    @Args('customerId') customerId: string,
    @Args('planId') planId: string,
    @Args('startDate') startDate: Date
  ) {
    return this.billing.createSubscription(customerId, planId, startDate);
  }

  @Mutation(() => [InvoiceModel])
  generateMonthlyInvoices(@Args('billingMonth') billingMonth: string) {
    return this.billing.generateMonthlyInvoices(billingMonth);
  }

  @Mutation(() => InvoiceModel)
  recordPayment(
    @Args('invoiceId') invoiceId: string,
    @Args('amount', { type: () => Float }) amount: number,
    @Args('paidAt') paidAt: Date
  ) {
    return this.billing.recordPayment(invoiceId, amount, paidAt);
  }
}
