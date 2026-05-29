import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from './customer.schema';
import { Plan } from './plan.schema';
import { Subscription } from './subscription.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, type: Types.ObjectId, ref: Customer.name })
  customer!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Plan.name })
  plan!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Subscription.name })
  subscription!: Types.ObjectId;

  @Prop({ required: true, index: true })
  billingMonth!: string;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ default: 0, min: 0 })
  paidAmount!: number;

  @Prop({ default: 0, min: 0 })
  balance!: number;

  @Prop({ default: 'UNPAID', enum: ['UNPAID', 'PAID', 'VOID'] })
  status!: string;

  @Prop()
  paidAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ subscription: 1, billingMonth: 1 }, { unique: true });
