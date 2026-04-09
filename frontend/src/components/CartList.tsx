import type { CartItem } from "../types/cart";

type Props = {
  items: CartItem[];
};

export default function CartList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div style={{ padding: "20px", color: "#666" }}>
        <h2>Esperando escaneo...</h2>
        <p>Escanea un producto para comenzar la venta</p>
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
            className="cart-item"
            style={{
              background: isLast ? "#d4fcd4" : "transparent",
              transform: isLast ? "scale(1.02)" : "scale(1)",
              transition: "all 0.15s ease",
            }}
          >
            <span>{item.name}</span>
            <span>
              <strong style={{ fontSize: "18px" }}>x{item.quantity}</strong> $
              {item.unit_price.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
