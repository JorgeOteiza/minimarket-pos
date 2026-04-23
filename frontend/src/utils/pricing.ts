export const calculatePriceWithIVA = (price: number, iva = 0.19) =>
  price * (1 + iva);

export const calculateProfit = (price: number, cost: number) => price - cost;

export const calculateMargin = (profit: number, cost: number) => {
  if (cost <= 0) return 0;
  return (profit / cost) * 100;
};
