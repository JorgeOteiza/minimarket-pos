import type { CartItem } from "../types/cart";
import CartItemRow from "./CartItemRow";

type Props = {
  items: CartItem[];
  lastScannedId: number | null;
};

export default function CartList({ items, lastScannedId }: Props) {
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-content">
          <div className="empty-icon">🛒</div>

          <h2>Listo para vender</h2>

          <p>Escanea un producto para comenzar la venta</p>

          <div className="empty-hint">
            <span>Usa lector o escribe el código manualmente</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => {
        const isHighlighted = item.product_id === lastScannedId;

        return (
          <CartItemRow
            key={`${item.product_id}-${item.quantity}`}
            item={item}
            highlight={isHighlighted}
          />
        );
      })}
    </div>
  );
}
