import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CustomerModel {
  @Field(() => ID)
  id!: string;

  @Field()
  accountNo!: string;

  @Field()
  lastName!: string;

  @Field()
  firstName!: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field()
  address!: string;

  @Field()
  contactNo!: string;

  @Field()
  status!: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class PlanModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  speed!: string;

  @Field(() => Float)
  monthlyPrice!: number;

  @Field()
  description!: string;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class SubscriptionModel {
  @Field(() => ID)
  id!: string;

  @Field(() => CustomerModel)
  customer!: CustomerModel;

  @Field(() => PlanModel)
  plan!: PlanModel;

  @Field()
  startDate!: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  status!: string;
}

@ObjectType()
export class InvoiceModel {
  @Field(() => ID)
  id!: string;

  @Field(() => CustomerModel)
  customer!: CustomerModel;

  @Field(() => PlanModel)
  plan!: PlanModel;

  @Field(() => SubscriptionModel)
  subscription!: SubscriptionModel;

  @Field()
  billingMonth!: string;

  @Field()
  dueDate!: Date;

  @Field(() => Float)
  amount!: number;

  @Field(() => Float, { nullable: true })
  paidAmount?: number;

  @Field(() => Float, { nullable: true })
  balance?: number;

  @Field()
  status!: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class PaymentModel {
  @Field(() => ID)
  id!: string;

  @Field(() => InvoiceModel)
  invoice!: InvoiceModel;

  @Field(() => CustomerModel)
  customer!: CustomerModel;

  @Field(() => Float)
  amount!: number;

  @Field()
  paidAt!: Date;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class DashboardStatsModel {
  @Field(() => Float)
  totalRevenue!: number;

  @Field()
  paidInvoices!: number;

  @Field()
  unpaidInvoices!: number;

  @Field()
  activeSubscriptions!: number;
}

@InputType()
export class CreateCustomerInput {
  @Field()
  accountNo!: string;

  @Field()
  lastName!: string;

  @Field()
  firstName!: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field()
  address!: string;

  @Field()
  contactNo!: string;
}

@InputType()
export class UpdateCustomerInput {
  @Field()
  accountNo!: string;

  @Field()
  lastName!: string;

  @Field()
  firstName!: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field()
  address!: string;

  @Field()
  contactNo!: string;

  @Field()
  status!: string;
}

@InputType()
export class CreatePlanInput {
  @Field()
  name!: string;

  @Field()
  speed!: string;

  @Field(() => Float)
  monthlyPrice!: number;

  @Field()
  description!: string;
}

@InputType()
export class UpdatePlanInput {
  @Field()
  name!: string;

  @Field()
  speed!: string;

  @Field(() => Float)
  monthlyPrice!: number;

  @Field()
  description!: string;

  @Field()
  isActive!: boolean;
}
