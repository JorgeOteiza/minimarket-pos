import { memo, useEffect, useRef } from "react";
import type { CartItem } from "../types/cart";
import { formatCurrency } from "../../utils/format";

type Props = {
  item: CartItem;
  highlight: boolean;
};

const CartItemRow = ({ item, highlight }: Props) => {
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
      <span>{item.name}</span>
      <span>
        <strong>x{item.quantity}</strong> {formatCurrency(item.unit_price)}
      </span>
    </div>
  );
};

export default memo(CartItemRow);
