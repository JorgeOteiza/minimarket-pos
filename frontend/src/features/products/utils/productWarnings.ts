import type { CreateProductDTO } from "../types/product";

export type ProductWarnings = {
  price?: string;
  margin?: string;
  barcode?: string;
  stock?: string;
};

export const getProductWarnings = (
  formData: CreateProductDTO,
): ProductWarnings => {
  const warnings: ProductWarnings = {};

  const price = formData.price ?? 0;
  const cost = formData.cost ?? 0;

  const packUnits = formData.pack_units ?? 0;

  const stock = formData.stock ?? 0;

  const minStock = formData.min_stock ?? 0;

  const barcode = formData.barcode?.trim() ?? "";

  const marginPercent = (formData.margin ?? 0) * 100;

  // =========================
  // PRECIO MENOR A COSTO
  // =========================

  if (cost > 0 && packUnits > 0 && price > 0) {
    const unitCost = cost / packUnits;

    if (price < unitCost) {
      warnings.price = "El precio está bajo el costo unitario";
    }
  }

  // =========================
  // MARGEN MUY BAJO
  // =========================

  if (marginPercent > 0 && marginPercent < 10) {
    warnings.margin = "Margen comercial muy bajo";
  }

  // =========================
  // MARGEN SOSPECHOSAMENTE ALTO
  // =========================

  if (marginPercent > 300) {
    warnings.margin = "Margen extremadamente alto";
  }

  // =========================
  // BARCODE SOSPECHOSAMENTE CORTO
  // =========================

  if (barcode.length > 0 && barcode.length < 4) {
    warnings.barcode = "Código de barras demasiado corto";
  }

  // =========================
  // STOCK MÍNIMO MAYOR AL STOCK
  // =========================

  if (stock > 0 && minStock > stock) {
    warnings.stock = "El stock mínimo es mayor al stock actual";
  }

  return warnings;
};
