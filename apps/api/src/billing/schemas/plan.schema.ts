import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlanDocument = HydratedDocument<Plan>;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  speed!: string;

  @Prop({ required: true, min: 0 })
  monthlyPrice!: number;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
