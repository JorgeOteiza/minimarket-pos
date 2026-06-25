export const normalizeText = (value: string): string => {
  return value.replace(/\s+/g, " ").toUpperCase();
};

export const normalizeTextForSubmit = (value: string): string => {
  return normalizeText(value).trim();
};

export const normalizeBarcode = (value: string): string => {
  return value.trim();
};

export const normalizeNumber = (
  value: number | null | undefined,
): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Number(value);
};
