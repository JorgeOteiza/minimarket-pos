import type { CartItem } from "../types/cart";

type Props = {
  items: CartItem[];
};

export default function CartList({ items }: Props) {
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
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.product_id}
            className={`cart-item ${isLast ? "highlight" : ""}`}
          >
            <span>{item.name}</span>
            <span>
              <strong>x{item.quantity}</strong> ${item.unit_price.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
