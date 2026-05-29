import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from './product.schema';

export type StockMovementDocument = HydratedDocument<StockMovement>;

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ required: true, type: Types.ObjectId, ref: Product.name })
  product!: Types.ObjectId;

  @Prop({ required: true, enum: ['IN', 'OUT'] })
  type!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true })
  movedAt!: Date;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
