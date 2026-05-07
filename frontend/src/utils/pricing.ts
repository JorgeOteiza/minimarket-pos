export const DEFAULT_IVA = 0.19;

export const calculateCostWithIva = (unitCost: number, iva = DEFAULT_IVA) => {
  return unitCost * (1 + iva);
};

export const calculateNetPrice = (price: number, iva = DEFAULT_IVA) =>
  price / (1 + iva);

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

export const normalizeMargin = (margin?: number | null) => {
  if (margin == null || Number.isNaN(margin)) return 0;
  return margin > 1 ? margin / 100 : margin;
};

export const calculateSuggestedPriceWithIva = (
  unitCost: number,
  margin?: number | null,
  iva = DEFAULT_IVA,
) => {
  const normalizedMargin = normalizeMargin(margin);
  return unitCost * (1 + normalizedMargin) * (1 + iva);
};
