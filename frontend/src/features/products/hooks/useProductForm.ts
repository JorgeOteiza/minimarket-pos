import { useState } from "react";

import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
} from "../types/product";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productApi";

import {
  normalizeText,
  normalizeBarcode,
  normalizeNumber,
} from "../utils/productNormalization";

import { calculateSalePrice } from "../utils/productCalculations";
import { getProductWarnings } from "../utils/productWarnings";
import { useBarcodeValidation } from "./useBarcodeValidation";

import {
  validateProductForm,
  type ProductFieldErrors,
} from "../validators/productValidators";

type UseProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
  onCreated?: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  onDeleted?: (productId: number) => void;
  onCancel?: () => void;
};

const EMPTY_FORM: CreateProductDTO = {
  name: "",
  pack_units: null,
  price: null,
  cost: null,
  barcode: "",
  stock: 0,
  margin: 0,
  min_stock: 0,
  iva: 0.19,
};

export const useProductForm = ({
  mode,
  product,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProductFormProps) => {
  const initialFormData: CreateProductDTO = {
    name: product?.name ?? "",
    pack_units: product?.pack_units ?? product?.stock ?? null,
    price: product?.price ?? null,
    cost: product?.cost ?? null,
    barcode: product?.barcode ?? "",
    stock: product?.stock ?? 0,
    margin: product?.margin ?? 0,
    min_stock: product?.min_stock ?? 0,
    iva: product?.iva ?? 0.19,
  };

  const [formData, setFormData] = useState<CreateProductDTO>(initialFormData);

  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasUnsavedChanges =
    JSON.stringify(formData) !== JSON.stringify(initialFormData);
  const { barcodeWarning } = useBarcodeValidation({
    barcode: formData.barcode ?? "",
    currentProductId: product?.id,
  });

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: "",
      general: "",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let normalizedValue: string | number | null = value;

    // =========================
    // TEXT FIELDS
    // =========================

    if (name === "name") {
      normalizedValue = normalizeText(value);
    } else if (name === "barcode") {
      normalizedValue = normalizeBarcode(value);
    }

    // =========================
    // NUMBER FIELDS
    // =========================
    else {
      normalizedValue = value === "" ? null : normalizeNumber(Number(value));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));

    clearFieldError(name);
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^0+(?=\d)/, "");

    const marginPercent = raw === "" ? 0 : Number(raw);

    const marginDecimal = marginPercent / 100;

    const newPrice = calculateSalePrice({
      cost: formData.cost ?? null,
      packUnits: formData.pack_units ?? formData.stock ?? 0,
      marginPercent,
      iva: formData.iva ?? 0.19,
    });

    setFormData((prev) => ({
      ...prev,
      margin: marginDecimal,
      price: newPrice,
    }));

    clearFieldError("margin");
    clearFieldError("price");
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setFieldErrors({});

    setSuccessMessage(null);

    const errors = validateProductForm(formData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setLoading(false);

      return;
    }

    try {
      if (mode === "create") {
        const created = await createProduct(formData);

        onCreated?.(created);

        setSuccessMessage("Producto creado correctamente");

        resetForm();
      }

      if (mode === "edit" && product) {
        const updated = await updateProduct(
          product.id,
          formData as UpdateProductDTO,
        );

        onUpdated?.(updated);

        setSuccessMessage("Producto actualizado correctamente");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.message;

        if (
          message.toLowerCase().includes("barcode") ||
          message.toLowerCase().includes("unique")
        ) {
          setFieldErrors({
            barcode: "El código de barras ya existe",
          });
        } else {
          setFieldErrors({
            general: message,
          });
        }
      } else {
        setFieldErrors({
          general: "Error desconocido",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || mode !== "edit") {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    setFieldErrors({});

    setSuccessMessage(null);

    try {
      await deleteProduct(product.id);

      onDeleted?.(product.id);

      setSuccessMessage("Producto eliminado correctamente");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFieldErrors({
          general: err.message,
        });
      } else {
        setFieldErrors({
          general: "No se pudo eliminar el producto",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const warnings = {
    ...getProductWarnings(formData),

    barcode: barcodeWarning || getProductWarnings(formData).barcode,
  };

  return {
    formData,
    setFormData,

    loading,

    fieldErrors,
    successMessage,
    warnings,

    hasUnsavedChanges,

    handleChange,
    handleMarginChange,
    handleSubmit,
    handleDelete,

    setFieldErrors,
    setSuccessMessage,
  };
};
