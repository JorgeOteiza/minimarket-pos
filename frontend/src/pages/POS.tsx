import { useEffect, useState } from "react";
import type { Cart } from "../types/cart";
import { getCart, scanProduct, checkout, clearCart } from "../api/cartApi";
import CartList from "../components/CartList";
import SummaryPanel from "../components/SummaryPanel";
import { useScanner } from "../hooks/useScanner";
import { playBeep } from "../../utils/sound";

export default function POS() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Error cargando carrito");
    }
  };

  const handleScan = async (barcode: string) => {
    // ⚠️ evita escaneo mientras se procesa checkout/clear
    if (loading) return;

    try {
      const updatedCart = await scanProduct(barcode);
      setCart(updatedCart);

      playBeep();
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  useScanner(handleScan);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      await checkout();
      await loadCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      setLoading(true);
      setError(null);

      await clearCart();
      await loadCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-container">
      <div className="left">
        {error && <div className="error">{error}</div>}
        <CartList items={cart.items} />
      </div>

      <div className="right">
        <SummaryPanel
          total={cart.total}
          onCheckout={handleCheckout}
          onClear={handleClear}
          loading={loading}
        />
      </div>
    </div>
  );
}
