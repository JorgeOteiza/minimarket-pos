export const DEFAULT_IVA = 0.19;

/**
 * En este POS, price representa el precio final que cobra el negocio,
 * es decir, precio con IVA incluido.
 */
export const calculateFinalPrice = (price: number) => price;

/**
 * Calcula el valor neto desde un precio final con IVA incluido.
 */
export const calculateNetPrice = (price: number, iva = DEFAULT_IVA) =>
  price / (1 + iva);

/**
 * Utilidad real:
 * precio neto - costo unitario.
 */
export const calculateProfit = (
  finalPrice: number,
  unitCost: number,
  iva = DEFAULT_IVA,
) => {
  const netPrice = calculateNetPrice(finalPrice, iva);
  return netPrice - unitCost;
};

export const calculateMargin = (profit: number, unitCost: number) => {
  if (unitCost <= 0) return 0;
  return (profit / unitCost) * 100;
};
