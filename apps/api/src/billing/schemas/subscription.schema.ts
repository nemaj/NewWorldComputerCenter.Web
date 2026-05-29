import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from './customer.schema';
import { Plan } from './plan.schema';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, type: Types.ObjectId, ref: Customer.name })
  customer!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Plan.name })
  plan!: Types.ObjectId;

  @Prop({ required: true })
  startDate!: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'CANCELLED'] })
  status!: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
