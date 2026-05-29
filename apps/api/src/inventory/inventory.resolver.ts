import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InventoryService } from './inventory.service';
import { CreateProductInput, ProductModel, StockMovementModel, UpdateProductInput } from './models';

@Resolver()
export class InventoryResolver {
  constructor(private readonly inventory: InventoryService) {}

  @Query(() => [ProductModel])
  products() {
    return this.inventory.productsList();
  }

  @Query(() => [StockMovementModel])
  stockMovements() {
    return this.inventory.stockMovementList();
  }

  @Mutation(() => ProductModel)
  createProduct(@Args('input') input: CreateProductInput) {
    return this.inventory.createProduct(input);
  }

  @Mutation(() => ProductModel)
  updateProduct(@Args('id') id: string, @Args('input') input: UpdateProductInput) {
    return this.inventory.updateProduct(id, input);
  }

  @Mutation(() => ProductModel)
  addProductStock(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int }) quantity: number
  ) {
    return this.inventory.addStock(productId, quantity);
  }

  @Mutation(() => ProductModel)
  moveOutProductStock(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int }) quantity: number
  ) {
    return this.inventory.moveOutStock(productId, quantity);
  }
}
