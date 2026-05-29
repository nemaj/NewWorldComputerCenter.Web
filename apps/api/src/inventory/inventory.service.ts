import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductInput, UpdateProductInput } from './models';
import { Product } from './schemas/product.schema';
import { StockMovement } from './schemas/stock-movement.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private readonly products: Model<Product>,
    @InjectModel(StockMovement.name) private readonly stockMovements: Model<StockMovement>
  ) {}

  productsList() {
    return this.products.find().sort({ name: 1 });
  }

  async createProduct(input: CreateProductInput) {
    const product = await this.products.create(input);

    if (product.quantity > 0) {
      await this.stockMovements.create({
        product: product._id,
        type: 'IN',
        quantity: product.quantity,
        movedAt: new Date()
      });
    }

    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await this.products.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  stockMovementList() {
    return this.stockMovements.find().populate('product').sort({ movedAt: -1 });
  }

  async addStock(productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const product = await this.products.findByIdAndUpdate(
      productId,
      { $inc: { quantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.stockMovements.create({
      product: product._id,
      type: 'IN',
      quantity,
      movedAt: new Date()
    });

    return product;
  }

  async moveOutStock(productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const product = await this.products.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (quantity > product.quantity) {
      throw new BadRequestException('Cannot move out more stock than is available');
    }

    product.quantity -= quantity;
    const updated = await product.save();

    await this.stockMovements.create({
      product: product._id,
      type: 'OUT',
      quantity,
      movedAt: new Date()
    });

    return updated;
  }
}
