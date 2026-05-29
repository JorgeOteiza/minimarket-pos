import { useCallback, useEffect, useState } from "react";

import type { Cart } from "../types/cart";

import {
  getCart,
  scanProduct,
  checkout,
  clearCart,
  increaseCartItem,
  decreaseCartItem,
  removeCartItem,
} from "../api/cartApi";

import CartList from "../components/CartList";
import SummaryPanel from "../components/SummaryPanel";

import ProductSearchInput from "../components/ProductSearchInput";

import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const EMPTY_CART: Cart = {
  items: [],
  total: 0,
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }

  return "Error inesperado";
};

export default function POS() {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [lastScannedId, setLastScannedId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // =========================
  // VALIDACIONES POS
  // =========================

  const hasProductsWithoutPrice = cart.items.some(
    (item) => item.has_price === false || item.unit_price === 0,
  );

  // =========================
  // STATUS BADGE
  // =========================

  const posStatus = error
    ? {
        label: "No disponible",
        className: "danger",
      }
    : hasProductsWithoutPrice
      ? {
          label: "Revisar productos",
          className: "warning",
        }
      : loading
        ? {
            label: "Procesando",
            className: "neutral",
          }
        : {
            label: "Listo para vender",
            className: "success",
          };

  // =========================
  // SOUNDS
  // =========================

  const playErrorSound = useCallback(() => {
    const audio = new Audio("/sounds/error.mp3");

    audio.play().catch(() => {});
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    let isMounted = true;

    void getCart()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setCart(data);

        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }

        console.error(err);

        setError("Error cargando carrito");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // RELOAD CART
  // =========================

  const reloadCart = useCallback(async () => {
    const data = await getCart();

    setCart(data);

    setError(null);

    return data;
  }, []);

  // =========================
  // SCAN / SEARCH PRODUCT
  // =========================

  const handleScan = useCallback(
    async (barcode: string) => {
      if (loading) {
        return;
      }

      const cleanBarcode = barcode.trim();

      if (!cleanBarcode) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const updatedCart = await scanProduct(cleanBarcode);

        setCart(updatedCart);

        const lastItem = updatedCart.items[updatedCart.items.length - 1];

        if (lastItem) {
          setLastScannedId(lastItem.product_id);
        }
      } catch (err: unknown) {
        console.error(err);

        playErrorSound();

        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [loading, playErrorSound],
  );

  // =========================
  // CART ACTIONS
  // =========================

  const handleIncreaseItem = async (productId: number) => {
    try {
      setError(null);

      const updatedCart = await increaseCartItem(productId);

      setCart(updatedCart);

      setLastScannedId(productId);
    } catch (err: unknown) {
      console.error(err);

      setError(getErrorMessage(err));

      playErrorSound();
    }
  };

  const handleDecreaseItem = async (productId: number) => {
    try {
      setError(null);

      const updatedCart = await decreaseCartItem(productId);

      setCart(updatedCart);

      setLastScannedId(productId);
    } catch (err: unknown) {
      console.error(err);

      setError(getErrorMessage(err));

      playErrorSound();
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setError(null);

      const updatedCart = await removeCartItem(productId);

      setCart(updatedCart);

      if (lastScannedId === productId) {
        setLastScannedId(null);
      }
    } catch (err: unknown) {
      console.error(err);

      setError(getErrorMessage(err));

      playErrorSound();
    }
  };

  // =========================
  // CHECKOUT
  // =========================

  const handleCheckout = async () => {
    if (hasProductsWithoutPrice) {
      setError("Hay productos sin precio. No se puede completar la venta.");

      return;
    }

    try {
      setLoading(true);

      setError(null);

      const sale = await checkout();

      await reloadCart();

      setLastScannedId(null);

      setSuccessMessage(
        `Venta registrada correctamente · Total: $${sale.total.toLocaleString("es-CL")}`,
      );

      window.setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: unknown) {
      console.error(err);

      setError(getErrorMessage(err));

      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CLEAR CART
  // =========================

  const handleClear = async () => {
    try {
      setLoading(true);

      setError(null);

      const updatedCart = await clearCart();

      setCart(updatedCart);

      setLastScannedId(null);
    } catch (err: unknown) {
      console.error(err);

      setError(getErrorMessage(err));

      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REMOVE LAST
  // =========================

  const handleRemoveLast = async () => {
    if (cart.items.length === 0) {
      return;
    }

    const lastItem = cart.items[cart.items.length - 1];

    await handleDecreaseItem(lastItem.product_id);
  };

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================

  useKeyboardShortcuts({
    onCheckout: handleCheckout,

    onClear: handleClear,

    onRemoveLast: handleRemoveLast,

    disabled: loading,
  });

  // =========================
  // LAST ITEM
  // =========================

  const lastScannedItem =
    lastScannedId !== null
      ? cart.items.find((item) => item.product_id === lastScannedId)
      : undefined;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="pos-container">
      <header className="pos-header pos-header-modern">
        <div>
          <h1>POS Minimarket</h1>

          <p>Caja activa · Modo offline</p>
        </div>

        <div className={`pos-status-pill ${posStatus.className}`}>
          <span className="status-dot" />

          {posStatus.label}
        </div>
      </header>

      <main className="pos-main">
        <section className="pos-left">
          {/* =========================
              ALERTS
          ========================= */}

          {error && <div className="error">{error}</div>}

          {hasProductsWithoutPrice && (
            <div className="warning">
              ⚠️ Hay productos sin precio. No puedes cobrar hasta corregirlos.
            </div>
          )}

          {/* =========================
              PRODUCT SEARCH INPUT
          ========================= */}

          <ProductSearchInput disabled={loading} onSelect={handleScan} />

          {/* =========================
              CART
          ========================= */}

          <CartList
            items={cart.items}
            lastScannedId={lastScannedId}
            onIncrease={handleIncreaseItem}
            onDecrease={handleDecreaseItem}
            onRemove={handleRemoveItem}
          />
        </section>

        {/* =========================
            SUMMARY
        ========================= */}

        <aside className="pos-right">
          <SummaryPanel
            total={cart.total}
            onCheckout={handleCheckout}
            onClear={handleClear}
            loading={loading}
            disabled={cart.items.length === 0 || hasProductsWithoutPrice}
            lastItem={lastScannedItem}
            successMessage={successMessage}
          />
        </aside>
      </main>
    </div>
  );
}
