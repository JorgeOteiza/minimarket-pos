export interface Product {
  id: number;
  name: string;
  price: number | null;
  cost?: number | null;
  barcode?: string | null;
  stock: number;
  min_stock?: number;
  margin?: number;
  is_weighted?: boolean;
  weight?: number;
  iva?: number;
  category_id?: number | null;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number | null;
  stock?: number;
  barcode?: string | null;
  category_id?: number | null;
  cost?: number | null;
  margin?: number;
  min_stock?: number;
  iva?: number;
}
