export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
