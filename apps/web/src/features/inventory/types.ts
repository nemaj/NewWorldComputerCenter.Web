export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  movedAt: string;
  createdAt: string;
  product: Pick<Product, 'id' | 'sku' | 'name'>;
};
