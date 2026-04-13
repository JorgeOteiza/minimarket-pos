import { useEffect, useState, useMemo, useRef } from "react";
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
  const [lastScannedId, setLastScannedId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // 🔊 AUDIO PRE-CARGADO
  const scanAudio = useMemo(() => new Audio("/sounds/scan.mp3"), []);
  const errorAudio = useMemo(() => new Audio("/sounds/error.mp3"), []);

  const playSound = (type: "ok" | "error") => {
    const audio = type === "ok" ? scanAudio : errorAudio;
    audio.currentTime = 0;
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

  // 🔥 mantener foco en scanner (sin robar foco al input manual)
  useEffect(() => {
    const focusInput = () => {
      if (document.activeElement?.tagName !== "INPUT") {
        inputRef.current?.focus();
      }
    };

    focusInput();

    window.addEventListener("click", focusInput);

    return () => {
      window.removeEventListener("click", focusInput);
    };
  }, []);

  // 🔍 escaneo
  const handleScan = async (barcode: string) => {
    if (loading) return;

    try {
      const updatedCart = await scanProduct(barcode);
      setCart(updatedCart);

      const lastItem = updatedCart.items[updatedCart.items.length - 1];
      if (lastItem) {
        setLastScannedId(lastItem.product_id);
      }

      playSound("ok");
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
      setCart(res.cart);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err));
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  // ⬅️ eliminar último
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

  useKeyboardShortcuts({
    onCheckout: handleCheckout,
    onClear: handleClear,
    onRemoveLast: handleRemoveLast,
    disabled: loading,
  });

  const lastScannedItem = cart.items.find(
    (item) => item.product_id === lastScannedId,
  );

  return (
    <div className="pos-container">
      <header className="pos-header">
        <h1>POS Minimarket</h1>
      </header>

      <main className="pos-main">
        <section className="pos-left">
          {error && <div className="error">{error}</div>}

          {/* 🔴 INPUT VISIBLE (fallback manual) */}
          <input
            className="pos-input"
            type="text"
            placeholder="Buscar producto manualmente..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  handleScan(value);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />

          {/* 🟢 INPUT OCULTO (scanner real) */}
          <input
            ref={inputRef}
            className="hidden-input"
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && manualCode.trim()) {
                handleScan(manualCode);
                setManualCode("");
              }
            }}
          />

          <CartList items={cart.items} lastScannedId={lastScannedId} />
        </section>

        <aside className="pos-right">
          <SummaryPanel
            total={cart.total}
            onCheckout={handleCheckout}
            onClear={handleClear}
            loading={loading}
            lastItem={lastScannedItem}
          />
        </aside>
      </main>

      <footer className="pos-footer">
        <span>F2: Checkout</span>
        <span>F4: Vaciar</span>
        <span>F8: Eliminar último</span>
      </footer>
    </div>
  );
}
