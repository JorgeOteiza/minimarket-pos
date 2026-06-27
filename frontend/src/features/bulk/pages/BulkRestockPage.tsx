import { useEffect, useMemo, useState, type FormEvent } from "react";

import ConfirmDialog from "../../../components/ui/ConfirmDialog";

import BulkProductsTable from "../components/BulkProductsTable";
import BulkRestockForm from "../components/BulkRestockForm";
import BulkRestockRegister from "../components/BulkRestockRegister";

import {
  createBulkProduct,
  createBulkRestock,
  deleteBulkProduct,
  getBulkProducts,
  getBulkRestocks,
  updateBulkProduct,
  type BulkProduct,
  type BulkProductDTO,
  type BulkRestock,
} from "../services/bulkApi";

import "../styles/sackRestock.css";

type NumericInputValue = number | "";

type SackFormState = {
  name: string;
  barcode: string;
  package_quantity: NumericInputValue;
  unit: string;
  cost: NumericInputValue;
  sale_margin: NumericInputValue;
};

type ConfirmAction = {
  type: "delete";
  product: BulkProduct;
} | null;

const IVA_RATE = 0.19;

const EMPTY_SACK_FORM: SackFormState = {
  name: "",
  barcode: "",
  package_quantity: "",
  unit: "kg",
  cost: "",
  sale_margin: 0.4,
};

const formatCurrency = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "—";

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
};

const formatDate = (value: string) => {
  const normalizedValue = value.endsWith("Z") ? value : `${value}Z`;

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(normalizedValue))
    .replace("a. m.", "AM")
    .replace("p. m.", "PM");
};

const getKgPricing = (product: BulkProduct) => {
  if (product.unit !== "kg") return null;
  if (product.cost === null || product.cost <= 0) return null;
  if (product.package_quantity <= 0) return null;

  const margin = product.sale_margin ?? 0.4;

  const costPerKgWithoutIva = product.cost / product.package_quantity;
  const costPerKgWithIva = costPerKgWithoutIva * (1 + IVA_RATE);
  const salePricePerKg = costPerKgWithIva * (1 + margin);

  return {
    margin,
    costPerKgWithoutIva,
    costPerKgWithIva,
    salePricePerKg,
  };
};

const toSackDTO = (form: SackFormState): BulkProductDTO => ({
  name: form.name.trim(),
  barcode: form.barcode.trim(),
  package_quantity: Number(form.package_quantity),
  unit: form.unit,
  cost: form.cost,
  sale_margin: Number(form.sale_margin),
});

export default function BulkRestockPage() {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [restocks, setRestocks] = useState<BulkRestock[]>([]);

  const [restockBarcode, setRestockBarcode] = useState("");
  const [quantityPackages, setQuantityPackages] =
    useState<NumericInputValue>(1);
  const [note, setNote] = useState("");

  const [sackForm, setSackForm] = useState<SackFormState>(EMPTY_SACK_FORM);
  const [initialPackages, setInitialPackages] = useState<NumericInputValue>(1);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProduct = useMemo(() => {
    const cleanBarcode = restockBarcode.trim();

    if (!cleanBarcode) return null;

    return products.find((product) => product.barcode === cleanBarcode) ?? null;
  }, [restockBarcode, products]);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [editingProductId, products],
  );

  const isEditing = editingProductId !== null;

  const hasSackFormData =
    sackForm.name.trim() !== "" ||
    sackForm.barcode.trim() !== "" ||
    sackForm.package_quantity !== "" ||
    sackForm.cost !== "" ||
    sackForm.sale_margin !== EMPTY_SACK_FORM.sale_margin ||
    initialPackages !== 1 ||
    isEditing;

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [productsData, restocksData] = await Promise.all([
          getBulkProducts(),
          getBulkRestocks(),
        ]);

        if (!isMounted) return;

        setProducts(productsData);
        setRestocks(restocksData);
        setError("");
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Error cargando datos");
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSackForm = <K extends keyof SackFormState>(
    key: K,
    value: SackFormState[K],
  ) => {
    setSackForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSackForm = () => {
    setSackForm(EMPTY_SACK_FORM);
    setInitialPackages(1);
    setEditingProductId(null);
    setError("");
    setSuccessMessage("");
  };

  const validateSackForm = () => {
    if (!sackForm.name.trim()) {
      setError("Debes ingresar el nombre del producto.");
      return false;
    }

    if (!sackForm.barcode.trim()) {
      setError("Debes ingresar o escanear el código del producto.");
      return false;
    }

    if (sackForm.package_quantity === "" || sackForm.package_quantity <= 0) {
      setError("La cantidad o peso del producto debe ser mayor a 0.");
      return false;
    }

    if (!isEditing && (initialPackages === "" || initialPackages <= 0)) {
      setError("La cantidad inicial de productos debe ser mayor a 0.");
      return false;
    }

    return true;
  };

  const handleCreateOrUpdateSack = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateSackForm()) return;

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      if (isEditing && editingProductId !== null) {
        const updated = await updateBulkProduct(
          editingProductId,
          toSackDTO(sackForm),
        );

        setProducts((prev) =>
          prev
            .map((product) => (product.id === updated.id ? updated : product))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );

        resetSackForm();
        setSuccessMessage("Producto actualizado correctamente.");
        return;
      }

      const created = await createBulkProduct(toSackDTO(sackForm));

      const firstRestock = await createBulkRestock({
        bulk_product_id: created.id,
        quantity_packages: Number(initialPackages),
        note: "Registro inicial de producto",
      });

      setProducts((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );

      setRestocks((prev) => [firstRestock, ...prev]);

      resetSackForm();
      setSuccessMessage("Producto registrado correctamente en el historial.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error guardando información del producto",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSack = (product: BulkProduct) => {
    setEditingProductId(product.id);
    setIsSidePanelOpen(true);

    setSackForm({
      name: product.name,
      barcode: product.barcode ?? "",
      package_quantity: product.package_quantity,
      unit: product.unit,
      cost: product.cost ?? "",
      sale_margin: product.sale_margin ?? 0.4,
    });

    setSuccessMessage("");
    setError("");
  };

  const handleDeleteSack = async (product: BulkProduct) => {
    try {
      setDeletingProductId(product.id);
      setError("");
      setSuccessMessage("");

      const result = await deleteBulkProduct(product.id);

      setProducts((prev) => prev.filter((item) => item.id !== product.id));

      if (editingProductId === product.id) {
        resetSackForm();
      }

      setSuccessMessage(result.message);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error eliminando el producto registrado",
      );
    } finally {
      setDeletingProductId(null);
      setConfirmAction(null);
    }
  };

  const handleRegisterRestock = async (event: FormEvent) => {
    event.preventDefault();

    if (!restockBarcode.trim()) {
      setError("Debes escanear o ingresar el código del producto.");
      return;
    }

    if (!selectedProduct) {
      setError("No se encontró un producto registrado con ese código.");
      return;
    }

    if (quantityPackages === "" || quantityPackages <= 0) {
      setError("La cantidad de productos debe ser mayor a 0.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const restock = await createBulkRestock({
        barcode: restockBarcode.trim(),
        quantity_packages: Number(quantityPackages),
        note: note.trim(),
      });

      setRestocks((prev) => [restock, ...prev]);

      setRestockBarcode("");
      setQuantityPackages(1);
      setNote("");

      setSuccessMessage("Reposición de producto registrada correctamente.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error registrando reposición",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sack-page">
      <header className="sack-header">
        <h1>Reposición de sacos y paquetes</h1>
        <p>
          Registra la llegada de sacos o paquetes completos y calcula precios
          referenciales por kg para venta a granel.
        </p>
      </header>

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div
        className={`sack-layout ${
          isSidePanelOpen ? "with-side-panel" : "without-side-panel"
        }`}
      >
        <main className="sack-main">
          <BulkRestockRegister
            loading={loading}
            restockBarcode={restockBarcode}
            quantityPackages={quantityPackages}
            note={note}
            selectedProduct={selectedProduct}
            onBarcodeChange={setRestockBarcode}
            onQuantityChange={setQuantityPackages}
            onNoteChange={setNote}
            onSubmit={handleRegisterRestock}
            formatCurrency={formatCurrency}
          />

          <BulkProductsTable
            products={products}
            deletingProductId={deletingProductId}
            onEdit={handleEditSack}
            formatCurrency={formatCurrency}
            getKgPricing={getKgPricing}
          />

          <section className="sack-card">
            <div className="inventory-history-header">
              <div>
                <h2>Historial de reposiciones</h2>
                <p>Últimos ingresos de productos o formatos grandes.</p>
              </div>

              <span>{restocks.length} registros</span>
            </div>

            <div className="sack-table-wrapper">
              <table className="sack-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Formato</th>
                    <th>Costo producto</th>
                    <th>Total</th>
                    <th>Nota</th>
                  </tr>
                </thead>

                <tbody>
                  {restocks.map((restock) => (
                    <tr key={restock.id}>
                      <td>{formatDate(restock.created_at)}</td>
                      <td>{restock.product_name}</td>
                      <td>{restock.quantity_packages}</td>
                      <td>
                        {restock.package_quantity} {restock.unit}
                      </td>
                      <td>{formatCurrency(restock.unit_cost)}</td>
                      <td>{formatCurrency(restock.total_cost)}</td>
                      <td>{restock.note || "—"}</td>
                    </tr>
                  ))}

                  {restocks.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        No hay reposiciones registradas todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <button
          type="button"
          className="sack-sidebar-toggle"
          onClick={() => setIsSidePanelOpen((prev) => !prev)}
          title={isSidePanelOpen ? "Ocultar panel" : "Mostrar panel"}
        >
          {isSidePanelOpen ? "›" : "‹"}
        </button>

        {isSidePanelOpen && (
          <aside className="sack-side">
            <BulkRestockForm
              isEditing={isEditing}
              editingProduct={editingProduct}
              loading={loading}
              deletingProductId={deletingProductId}
              sackForm={sackForm}
              initialPackages={initialPackages}
              hasSackFormData={hasSackFormData}
              onUpdateSackForm={updateSackForm}
              onSetInitialPackages={setInitialPackages}
              onResetSackForm={resetSackForm}
              onSubmit={handleCreateOrUpdateSack}
              onDeleteClick={() => {
                if (editingProduct) {
                  setConfirmAction({
                    type: "delete",
                    product: editingProduct,
                  });
                }
              }}
            />
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title="Eliminar producto"
        description={
          confirmAction
            ? `¿Eliminar "${confirmAction.product.name}"? El producto dejará de aparecer en la lista, pero el historial de reposiciones se conservará.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={
          confirmAction ? deletingProductId === confirmAction.product.id : false
        }
        onConfirm={() => {
          if (confirmAction) {
            void handleDeleteSack(confirmAction.product);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
