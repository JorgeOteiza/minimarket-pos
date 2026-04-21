export interface Product {
  id: number;
  name: string;
  price: number;

  cost?: number;
  barcode?: string;

  stock: number;
  min_stock?: number;

  margin?: number;

  is_weighted?: boolean;
  weight?: number;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  stock?: number;
  barcode?: string;
  category_id?: number;
  cost?: number;
  margin?: number;
  min_stock?: number;
}
