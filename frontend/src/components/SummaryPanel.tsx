import { formatCurrency } from "../../utils/format";

type Props = {
  total: number;
  onCheckout: () => Promise<void>;
  onClear: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
  successMessage?: string | null;
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
  successMessage = null,
  lastItem,
}: Props) {
  const actionsDisabled = loading || disabled;

  return (
    <div className="summary-panel">
      <div>
        <h2 className="total">Total</h2>
        <div className="total-amount">{formatCurrency(total)}</div>
      </div>

      {successMessage && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            border: "3px solid #86efac",
            borderRadius: "20px",
            padding: "24px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            textAlign: "center",
            fontSize: "30px",
            fontWeight: 900,
            lineHeight: 1.35,
          }}
        >
          <span style={{ fontSize: "36px", fontWeight: 900 }}>✓</span>
          <strong>{successMessage}</strong>
        </div>
      )}

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
          <span className="summary-action-icon">🛒</span>
          <span>{loading ? "Procesando..." : "Cobrar"}</span>
        </button>

        <button
          type="button"
          className="clear-cart-button"
          onClick={onClear}
          disabled={actionsDisabled}
        >
          <span className="summary-action-icon">🗑</span>
          <span>Anular compra</span>
        </button>
      </div>
    </div>
  );
}
