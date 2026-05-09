import { memo, useEffect, useRef } from "react";
import type { CartItem } from "../types/cart";
import { formatCurrency } from "../../utils/format";

type Props = {
  item: CartItem;
  highlight: boolean;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
};

const CartItemRow = ({
  item,
  highlight,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasNoPrice = item.has_price === false || item.unit_price === 0;

  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlight]);

  return (
    <div
      ref={ref}
      className={`cart-item ${highlight ? "highlight flash" : ""} ${
        hasNoPrice ? "cart-item-warning" : ""
      }`}
    >
      <div className="cart-item-info">
        <span className="cart-item-name">{item.name}</span>

        {hasNoPrice ? (
          <span className="cart-item-no-price">❗ Producto sin precio</span>
        ) : (
          <span className="cart-item-price">
            {formatCurrency(item.unit_price)} c/u
          </span>
        )}
      </div>

      <div className="cart-item-controls">
        <button type="button" onClick={() => onDecrease(item.product_id)}>
          −
        </button>

        <strong>{item.quantity}</strong>

        <button type="button" onClick={() => onIncrease(item.product_id)}>
          +
        </button>

        <button
          type="button"
          className="cart-item-remove"
          onClick={() => onRemove(item.product_id)}
          title="Quitar producto"
        >
          ×
        </button>
      </div>

      <div className="cart-item-subtotal">
        {hasNoPrice ? "—" : formatCurrency(item.subtotal)}
      </div>
    </div>
  );
};

export default memo(CartItemRow);
