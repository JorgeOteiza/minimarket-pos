type Props = {
  total: number;
  onCheckout: () => Promise<void>;
  onClear: () => Promise<void>;
  loading: boolean;
};

export default function SummaryPanel({
  total,
  onCheckout,
  onClear,
  loading,
}: Props) {
  return (
    <div>
      <h2 className="total">Total</h2>
      <div className="total-amount">${total.toFixed(2)}</div>

      <button onClick={onCheckout} disabled={loading}>
        {loading ? "Procesando..." : "Cobrar"}
      </button>

      <button onClick={onClear} disabled={loading}>
        Vaciar carrito
      </button>
    </div>
  );
}
