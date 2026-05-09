import type { CartItem } from "../types/cart";
import CartItemRow from "./CartItemRow";

type Props = {
  items: CartItem[];
  lastScannedId: number | null;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
};

export default function CartList({
  items,
  lastScannedId,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
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
    <div className="cart-list">
      <div className="cart-list-header">
        <span>Producto</span>
        <span>Cantidad</span>
        <span>Subtotal</span>
      </div>

      {items.map((item) => (
        <CartItemRow
          key={item.product_id}
          item={item}
          highlight={item.product_id === lastScannedId}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
