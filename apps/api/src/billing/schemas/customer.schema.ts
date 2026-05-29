import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  @Prop({
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: (value: string) => /[A-Za-z]/.test(value) && /\d/.test(value),
      message: 'Account No. must contain both letters and numbers'
    }
  })
  accountNo!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ trim: true })
  middleName?: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true, trim: true })
  contactNo!: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  status!: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
