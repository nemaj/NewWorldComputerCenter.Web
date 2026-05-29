import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductModel {
  @Field(() => ID)
  id!: string;

  @Field()
  sku!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  quantity!: number;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class StockMovementModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ProductModel)
  product!: ProductModel;

  @Field()
  type!: string;

  @Field(() => Int)
  quantity!: number;

  @Field()
  movedAt!: Date;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateProductInput {
  @Field()
  sku!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  quantity!: number;
}

@InputType()
export class UpdateProductInput {
  @Field()
  sku!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}
