import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from './customer.schema';
import { Invoice } from './invoice.schema';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, type: Types.ObjectId, ref: Invoice.name })
  invoice!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Customer.name })
  customer!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true })
  paidAt!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
