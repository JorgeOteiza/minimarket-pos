export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  has_price?: boolean;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
