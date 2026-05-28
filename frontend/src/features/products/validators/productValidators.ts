import type { CreateProductDTO } from "../types/product";

export type ProductFieldErrors = Partial<Record<string, string>>;

export const validateProductForm = (
  formData: CreateProductDTO,
): ProductFieldErrors => {
  const errors: ProductFieldErrors = {};

  if (!formData.name?.trim()) {
    errors.name = "Debes ingresar un nombre";
  }

  if (
    formData.pack_units === null ||
    formData.pack_units === undefined ||
    formData.pack_units <= 0
  ) {
    errors.pack_units = "Debes ingresar unidades por caja";
  }

  if (
    formData.stock === null ||
    formData.stock === undefined ||
    formData.stock < 0
  ) {
    errors.stock = "Debes ingresar stock válido";
  }

  if (
    formData.min_stock === null ||
    formData.min_stock === undefined ||
    formData.min_stock < 0
  ) {
    errors.min_stock = "Debes ingresar stock mínimo";
  }

  if (
    formData.price === null ||
    formData.price === undefined ||
    formData.price <= 0
  ) {
    errors.price = "Debes ingresar precio de venta";
  }

  if (
    formData.cost === null ||
    formData.cost === undefined ||
    formData.cost <= 0
  ) {
    errors.cost = "Debes ingresar costo";
  }

  return errors;
};
