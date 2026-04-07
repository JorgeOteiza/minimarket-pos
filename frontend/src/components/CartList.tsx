import type { CartItem } from "../types/cart";

interface Props {
  items: CartItem[];
}

export default function CartList({ items }: Props) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.product_id} className="cart-item">
          <span>{item.name}</span>
          <span>x{item.quantity}</span>
          <span>${item.subtotal}</span>
        </div>
      ))}
    </div>
  );
}
