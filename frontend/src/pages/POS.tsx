import { useEffect, useState } from "react";
import type { Cart } from "../types/cart";
import { getCart, scanProduct, checkout, clearCart } from "../api/cartApi";
import CartList from "../components/CartList";
import SummaryPanel from "../components/SummaryPanel";
import { useScanner } from "../hooks/useScanner";

export default function POS() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err: any) {
      console.error(err);
      alert("Error cargando carrito");
    }
  };

  const handleScan = async (barcode: string) => {
    try {
      const updatedCart = await scanProduct(barcode);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err.message);
    }
  };

  useScanner(handleScan);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      await checkout();
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      setLoading(true);
      await clearCart();
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-container">
      <div className="left">
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
