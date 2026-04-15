export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category_id?: number;
  cost?: number;
}

export interface UpdateProductDTO {
  name: string;
  price: number;
  stock: number;
  barcode: string;
  category_id?: number;
  cost?: number;
}
