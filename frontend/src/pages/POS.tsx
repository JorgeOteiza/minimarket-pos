import { useEffect, useState } from "react";
import type { Cart } from "../types/cart";
import { getCart, scanProduct, checkout, clearCart } from "../api/cartApi";
import CartList from "../components/CartList";
import SummaryPanel from "../components/SummaryPanel";
import { useScanner } from "../hooks/useScanner";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return "Error inesperado";
};

export default function POS() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 🔊 sonidos
  const playSound = (type: "ok" | "error") => {
    const src = type === "ok" ? "/sounds/scan.mp3" : "/sounds/error.mp3";

    const audio = new Audio(src);
    audio.currentTime = 0; // evita solapamiento
    audio.play().catch(() => {});
  };

  // 🔄 cargar carrito
  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError("Error cargando carrito");
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // 🔍 escaneo (FIX: sonido SOLO si éxito)
  const handleScan = async (barcode: string) => {
    if (loading) return;

    try {
      const updatedCart = await scanProduct(barcode);
      setCart(updatedCart);

      playSound("ok"); // ✅ solo éxito
      setError(null);
    } catch (err: unknown) {
      console.error(err);

      playSound("error");
      setError(getErrorMessage(err));
    }
  };

  useScanner(handleScan);

  // 💰 checkout
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      await checkout();
      await loadCart();
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err));
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  // 🧹 limpiar carrito
  const handleClear = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await clearCart();
      setCart(res.cart); // 🔥 importante: no recargar innecesario
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err));
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  // ⬅️ eliminar último producto
  const handleRemoveLast = async () => {
    if (cart.items.length === 0) return;

    const lastItem = cart.items[cart.items.length - 1];

    try {
      setLoading(true);
      setError(null);

      await fetch(`/api/cart/decrease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: lastItem.product_id,
          quantity: 1,
        }),
      });

      await loadCart();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ shortcuts (ya corregidos: SIN ENTER)
  useKeyboardShortcuts({
    onCheckout: handleCheckout,
    onClear: handleClear,
    onRemoveLast: handleRemoveLast,
    disabled: loading,
  });

  return (
    <div className="pos-container">
      <div className="left">
        {/* 🔴 error visual */}
        {error && (
          <div
            style={{
              background: "#ffdddd",
              color: "#900",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            {error}
          </div>
        )}

        {/* 🔍 input manual */}
        <input
          type="text"
          placeholder="Escanear o escribir código..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && manualCode.trim()) {
              handleScan(manualCode);
              setManualCode("");
            }
          }}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "18px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

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
