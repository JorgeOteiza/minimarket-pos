import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  createBulkProduct,
  createBulkRestock,
  getBulkProducts,
  getBulkRestocks,
  updateBulkProduct,
  type BulkProduct,
  type BulkProductDTO,
  type BulkRestock,
} from "../services/bulkApi";

import "../styles/sackRestock.css";

type SackFormState = {
  name: string;
  barcode: string;
  package_quantity: number;
  unit: string;
  cost: number | "";
};

const EMPTY_SACK_FORM: SackFormState = {
  name: "",
  barcode: "",
  package_quantity: 25,
  unit: "kg",
  cost: "",
};

const formatCurrency = (value: number | null) => {
  if (value === null) return "—";

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const toSackDTO = (form: SackFormState): BulkProductDTO => ({
  name: form.name.trim(),
  barcode: form.barcode.trim(),
  package_quantity: form.package_quantity,
  unit: form.unit,
  cost: form.cost,
});

export default function BulkRestockPage() {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [restocks, setRestocks] = useState<BulkRestock[]>([]);

  const [restockBarcode, setRestockBarcode] = useState("");
  const [quantityPackages, setQuantityPackages] = useState(1);
  const [note, setNote] = useState("");

  const [sackForm, setSackForm] = useState<SackFormState>(EMPTY_SACK_FORM);
  const [initialPackages, setInitialPackages] = useState(1);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProduct = useMemo(() => {
    const cleanBarcode = restockBarcode.trim();

    if (!cleanBarcode) return null;

    return products.find((product) => product.barcode === cleanBarcode) ?? null;
  }, [restockBarcode, products]);

  const isEditing = editingProductId !== null;

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

    if (sackForm.package_quantity <= 0) {
      setError("La cantidad por producto debe ser mayor a 0.");
      return false;
    }

    if (!isEditing && initialPackages <= 0) {
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
        quantity_packages: initialPackages,
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

    setSackForm({
      name: product.name,
      barcode: product.barcode ?? "",
      package_quantity: product.package_quantity,
      unit: product.unit,
      cost: product.cost ?? "",
    });

    setSuccessMessage("");
    setError("");
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

    if (quantityPackages <= 0) {
      setError("La cantidad de productos debe ser mayor a 0.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const restock = await createBulkRestock({
        barcode: restockBarcode.trim(),
        quantity_packages: quantityPackages,
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
          Registra la llegada de sacos o paquetes completos u otros formatos
          grandes para control administrativo.
        </p>
      </header>

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="sack-layout">
        <main className="sack-main">
          <section className="sack-card">
            <h2>Registrar nueva reposición</h2>
            <p>Escanea el código del producto cuando llegue mercadería.</p>

            <form className="sack-form" onSubmit={handleRegisterRestock}>
              <div className="sack-form-grid">
                <div className="sack-field full">
                  <label>Código del saco/paquete</label>
                  <input
                    type="text"
                    value={restockBarcode}
                    onChange={(e) => setRestockBarcode(e.target.value)}
                    placeholder="Escanear o escribir código..."
                    autoFocus
                  />
                </div>

                {restockBarcode.trim() && (
                  <div
                    className={
                      selectedProduct
                        ? "sack-status success sack-field full"
                        : "sack-status warning sack-field full"
                    }
                  >
                    {selectedProduct
                      ? `Producto detectado: ${selectedProduct.name}`
                      : "No se encontró un producto registrado con ese código."}
                  </div>
                )}

                <div className="sack-field">
                  <label>Cantidad de sacos/paquetes</label>
                  <input
                    type="number"
                    min={1}
                    value={quantityPackages}
                    onChange={(e) =>
                      setQuantityPackages(Number(e.target.value))
                    }
                  />
                </div>

                <div className="sack-field">
                  <label>Nota</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="sack-summary">
                  <div>
                    <span>Producto</span>
                    <strong>{selectedProduct.name}</strong>
                  </div>

                  <div>
                    <span>Formato</span>
                    <strong>
                      {selectedProduct.package_quantity} {selectedProduct.unit}
                    </strong>
                  </div>

                  <div>
                    <span>Costo Producto</span>
                    <strong>{formatCurrency(selectedProduct.cost)}</strong>
                  </div>
                </div>
              )}

              <div className="sack-actions">
                <button
                  type="submit"
                  className="sack-primary-btn"
                  disabled={loading || !selectedProduct}
                >
                  {loading ? "Registrando..." : "Registrar reposición"}
                </button>
              </div>
            </form>
          </section>

          <section className="sack-card">
            <div className="inventory-history-header">
              <div>
                <h2>Productos registrados</h2>
                <p>Tipos de productos o formatos grandes guardados.</p>
              </div>

              <span>{products.length} productos</span>
            </div>

            <div className="sack-table-wrapper">
              <table className="sack-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Formato</th>
                    <th>Costo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.barcode || "—"}</td>
                      <td>
                        <span className="sack-badge">
                          {product.package_quantity} {product.unit}
                        </span>
                      </td>
                      <td>{formatCurrency(product.cost)}</td>
                      <td>
                        <button
                          type="button"
                          className="sack-edit-btn"
                          onClick={() => handleEditSack(product)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5}>No hay productos registrados todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

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

        <aside className="sack-side">
          <section className="sack-card">
            <h2>
              {isEditing ? "Editar producto" : "Registrar tipo de producto"}
            </h2>
            <p>
              {isEditing
                ? "Actualiza la información del producto registrado."
                : "Crea el producto base y registra su primera llegada al historial."}
            </p>

            <form className="sack-form" onSubmit={handleCreateOrUpdateSack}>
              <div className="sack-field">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  value={sackForm.name}
                  onChange={(e) => updateSackForm("name", e.target.value)}
                  placeholder="Ej: Alimento perro adulto 25 kg"
                />
              </div>

              <div className="sack-field">
                <label>Código del producto</label>
                <input
                  type="text"
                  value={sackForm.barcode}
                  onChange={(e) => updateSackForm("barcode", e.target.value)}
                  placeholder="Escanear código del producto o escribir uno nuevo"
                />
              </div>

              <div className="sack-form-grid">
                <div className="sack-field">
                  <label>Cantidad/peso</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={sackForm.package_quantity}
                    onChange={(e) =>
                      updateSackForm("package_quantity", Number(e.target.value))
                    }
                  />
                </div>

                <div className="sack-field">
                  <label>Unidad</label>
                  <select
                    value={sackForm.unit}
                    onChange={(e) => updateSackForm("unit", e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="unidades">unidades</option>
                  </select>
                </div>
              </div>

              <div className="sack-field">
                <label>Costo producto</label>
                <input
                  type="number"
                  min={0}
                  value={sackForm.cost}
                  onChange={(e) =>
                    updateSackForm(
                      "cost",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="$"
                />
              </div>

              {!isEditing && (
                <div className="sack-field">
                  <label>Productos recibidos ahora</label>
                  <input
                    type="number"
                    min={1}
                    value={initialPackages}
                    onChange={(e) => setInitialPackages(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="sack-actions">
                {isEditing && (
                  <button
                    type="button"
                    className="sack-secondary-btn"
                    onClick={resetSackForm}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="submit"
                  className="sack-primary-btn"
                  disabled={loading || !sackForm.name.trim()}
                >
                  {loading
                    ? "Guardando..."
                    : isEditing
                      ? "Guardar cambios"
                      : "Registrar saco"}
                </button>
              </div>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
