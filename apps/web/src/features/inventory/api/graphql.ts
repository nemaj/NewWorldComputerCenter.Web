import { gql } from '@apollo/client';

export const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      sku
      name
      description
      quantity
      createdAt
    }
    stockMovements {
      id
      type
      quantity
      movedAt
      createdAt
      product {
        id
        sku
        name
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      sku
      name
      description
      quantity
    }
  }
`;

export const ADD_PRODUCT_STOCK = gql`
  mutation AddProductStock($productId: String!, $quantity: Int!) {
    addProductStock(productId: $productId, quantity: $quantity) {
      id
      quantity
    }
  }
`;

export const MOVE_OUT_PRODUCT_STOCK = gql`
  mutation MoveOutProductStock($productId: String!, $quantity: Int!) {
    moveOutProductStock(productId: $productId, quantity: $quantity) {
      id
      quantity
    }
  }
`;
