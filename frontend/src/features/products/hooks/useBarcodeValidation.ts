import { useEffect, useState } from "react";

import { searchProducts } from "../services/productApi";

type Props = {
  barcode: string;
  currentProductId?: number;
};

export const useBarcodeValidation = ({ barcode, currentProductId }: Props) => {
  const [barcodeWarning, setBarcodeWarning] = useState("");

  const [checkingBarcode, setCheckingBarcode] = useState(false);

  useEffect(() => {
    const trimmed = barcode.trim();

    const validateBarcode = async () => {
      // =========================
      // VACÍO
      // =========================

      if (!trimmed) {
        setBarcodeWarning("");
        return;
      }

      // =========================
      // MUY CORTO
      // =========================

      if (trimmed.length < 4) {
        return;
      }

      try {
        setCheckingBarcode(true);

        const products = await searchProducts(trimmed);

        const exactMatch = products.find(
          (p) => p.barcode === trimmed && p.id !== currentProductId,
        );

        if (exactMatch) {
          setBarcodeWarning("Ya existe un producto con este código");
        } else {
          setBarcodeWarning("");
        }
      } catch {
        setBarcodeWarning("");
      } finally {
        setCheckingBarcode(false);
      }
    };

    const timeout = setTimeout(validateBarcode, 400);

    return () => clearTimeout(timeout);
  }, [barcode, currentProductId]);

  return {
    barcodeWarning,
    checkingBarcode,
  };
};
