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

const DEFAULT_IVA = 0.19;

const EMPTY_FORM: CreateProductDTO = {
  name: "",
  pack_units: null,
  price: null,
  cost: null,
  barcode: "",
  stock: 0,
  margin: 0.3,
  min_stock: 0,
  iva: DEFAULT_IVA,
};

const getInitialFormData = (product?: Product): CreateProductDTO => {
  const iva = product?.iva ?? DEFAULT_IVA;

  const calculatedMargin = calculateMarginFromValues(
    product?.cost,
    product?.pack_units,
    product?.price,
    iva,
  );

  return {
    name: product?.name ?? "",
    pack_units: product?.pack_units ?? null,
    price: product?.price ?? null,
    cost: product?.cost ?? null,
    barcode: product?.barcode ?? "",
    stock: product?.stock ?? 0,
    margin: calculatedMargin ?? product?.margin ?? 0.3,
    min_stock: product?.min_stock ?? 0,
    iva,
  };
};

const calculateMarginFromValues = (
  cost?: number | null,
  packUnits?: number | null,
  price?: number | null,
  iva = DEFAULT_IVA,
) => {
  if (!cost || !packUnits || packUnits <= 0 || !price || price <= 0) {
    return null;
  }

  const unitCost = Number(cost) / Number(packUnits);
  const costWithIva = unitCost * (1 + iva);

  if (costWithIva <= 0) {
    return null;
  }

  return (Number(price) - costWithIva) / costWithIva;
};

const toMarginPercent = (margin?: number | null) =>
  margin === null || margin === undefined
    ? ""
    : String(Math.round(margin * 100));

export const useProductForm = ({
  mode,
  product,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProductFormProps) => {
  const initialFormData = getInitialFormData(product);

  const [formData, setFormData] = useState<CreateProductDTO>(initialFormData);

  const [marginPercentInput, setMarginPercentInput] = useState(
    toMarginPercent(initialFormData.margin),
  );

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

  const recalculateMarginFromPrice = (
    cost: number | null | undefined,
    packUnits: number | null | undefined,
    price: number | null | undefined,
    iva: number,
  ) => {
    if (!cost || !packUnits || packUnits <= 0 || !price || price <= 0) {
      return null;
    }

    const unitCost = Number(cost) / Number(packUnits);
    const unitCostWithIva = unitCost * (1 + iva);

    if (unitCostWithIva <= 0) {
      return null;
    }

    return (Number(price) - unitCostWithIva) / unitCostWithIva;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let normalizedValue: string | number | null = value;

    if (name === "name") {
      normalizedValue = normalizeText(value);
    } else if (name === "barcode") {
      normalizedValue = normalizeBarcode(value);
    } else {
      normalizedValue = value === "" ? null : normalizeNumber(Number(value));
    }

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: normalizedValue,
      };

      if (name === "price") {
        const newMargin = recalculateMarginFromPrice(
          next.cost,
          next.pack_units,
          next.price,
          next.iva ?? DEFAULT_IVA,
        );

        if (newMargin !== null) {
          next.margin = newMargin;
          setMarginPercentInput(String(Math.round(newMargin * 100)));
        }
      }

      return next;
    });

    clearFieldError(name);
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^0+(?=\d)/, "");

    setMarginPercentInput(raw);

    const marginPercent = raw === "" ? null : Number(raw);

    if (marginPercent === null || Number.isNaN(marginPercent)) {
      setFormData((prev) => ({
        ...prev,
        margin: null,
        price: prev.price,
      }));

      clearFieldError("margin");
      return;
    }

    const marginDecimal = marginPercent / 100;

    const newPrice = calculateSalePrice({
      cost: formData.cost ?? null,
      packUnits: formData.pack_units ?? 0,
      marginPercent,
      iva: formData.iva ?? DEFAULT_IVA,
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
    setMarginPercentInput(toMarginPercent(EMPTY_FORM.margin));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setFieldErrors({});

    setSuccessMessage(null);

    const payload: CreateProductDTO = {
      ...formData,
      stock: mode === "create" ? 0 : formData.stock,
    };

    const errors = validateProductForm(payload);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setLoading(false);

      return;
    }

    try {
      if (mode === "create") {
        const created = await createProduct(payload);

        onCreated?.(created);

        setSuccessMessage("Producto creado correctamente");

        resetForm();
      }

      if (mode === "edit" && product) {
        const updated = await updateProduct(
          product.id,
          payload as UpdateProductDTO,
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
    marginPercentInput,

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
