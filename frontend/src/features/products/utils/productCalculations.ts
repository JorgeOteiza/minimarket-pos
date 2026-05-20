import { calculatePriceFromMargin } from "../../../utils/pricing";

type CalculatePriceParams = {
  cost: number | null;
  packUnits: number;
  marginPercent: number;
  iva?: number;
};

export const calculateSalePrice = ({
  cost,
  packUnits,
  marginPercent,
  iva = 0.19,
}: CalculatePriceParams): number | null => {
  if (cost === null || packUnits <= 0) {
    return null;
  }

  const unitCost = cost / packUnits;

  return Math.round(calculatePriceFromMargin(unitCost, marginPercent, iva));
};
