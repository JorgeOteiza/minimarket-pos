import { formatCurrency } from "../../utils/format";

type Props = {
  total: number;
  onCheckout: () => Promise<void>;
  onClear: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
  lastItem?:
    | {
        name: string;
        quantity: number;
      }
    | undefined;
};

export default function SummaryPanel({
  total,
  onCheckout,
  onClear,
  loading,
  disabled = false,
  lastItem,
}: Props) {
  const actionsDisabled = loading || disabled;

  return (
    <div className="summary-panel">
      <div>
        <h2 className="total">Total</h2>
        <div className="total-amount">{formatCurrency(total)}</div>
      </div>

      {lastItem && (
        <div className="last-item">
          <span>Último producto</span>
          <strong>{lastItem.name}</strong>
          <small>x{lastItem.quantity}</small>
        </div>
      )}

      <div className="summary-actions">
        <button
          type="button"
          className="checkout-button"
          onClick={onCheckout}
          disabled={actionsDisabled}
        >
          {loading ? "Procesando..." : "Cobrar"}
        </button>

        <button
          type="button"
          className="clear-cart-button"
          onClick={onClear}
          disabled={actionsDisabled}
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}
