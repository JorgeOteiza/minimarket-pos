import { formatCurrency } from "../../utils/format";

type Props = {
  total: number;
  onCheckout: () => Promise<void>;
  onClear: () => Promise<void>;
  loading: boolean;
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
  lastItem,
}: Props) {
  return (
    <div>
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

      <div>
        <button onClick={onCheckout} disabled={loading}>
          {loading ? "Procesando..." : "Cobrar"}
        </button>

        <button onClick={onClear} disabled={loading}>
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}
