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
      className={`cart-item ${highlight ? "highlight flash" : ""}`}
    >
      <div className="cart-item-info">
        <span className="cart-item-name">{item.name}</span>
        <span className="cart-item-price">
          {formatCurrency(item.unit_price)} c/u
        </span>
      </div>

      <div className="cart-item-controls">
        <button type="button" onClick={() => onDecrease(item.product_id)}>
          -
        </button>

        <strong>x{item.quantity}</strong>

        <button type="button" onClick={() => onIncrease(item.product_id)}>
          +
        </button>

        <button
          type="button"
          className="cart-item-remove"
          onClick={() => onRemove(item.product_id)}
        >
          ×
        </button>
      </div>

      <div className="cart-item-subtotal">{formatCurrency(item.subtotal)}</div>
    </div>
  );
};

export default memo(CartItemRow);
