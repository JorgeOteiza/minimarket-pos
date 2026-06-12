import { useEffect, useState } from "react";

import {
  getBusinessSettings,
  updateBusinessSettings,
  type BusinessSettings,
  type UpdateBusinessSettingsDTO,
} from "../services/businessSettingsApi";

import "../styles/businessSettings.css";

const emptyForm: UpdateBusinessSettingsDTO = {
  business_name: "",
  rut: "",
  address: "",
  phone: "",
  email: "",
  footer_message: "",
};

export default function BusinessSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [form, setForm] = useState<UpdateBusinessSettingsDTO>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBusinessSettings();

        if (!isMounted) return;

        setSettings(data);
        setForm({
          business_name: data.business_name || "",
          rut: data.rut || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          footer_message: data.footer_message || "",
        });
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    field: keyof UpdateBusinessSettingsDTO,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateBusinessSettings(form);

      setSettings(updated);
      setMessage("Configuración guardada correctamente.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="business-settings-loading">Cargando configuración...</p>
    );
  }

  return (
    <div className="business-settings-page">
      <div className="business-settings-header">
        <div>
          <h1>Configuración del negocio</h1>
          <p>
            Define los datos del local para reportes, comprobantes y documentos.
          </p>
        </div>
      </div>

      {message && <div className="business-settings-success">{message}</div>}

      {error && <div className="business-settings-error">{error}</div>}

      <div className="business-settings-layout">
        <section className="business-settings-card">
          <h2>Datos del negocio</h2>

          <form className="business-settings-form" onSubmit={handleSubmit}>
            <label>
              <span>Nombre del negocio</span>
              <input
                type="text"
                value={form.business_name}
                onChange={(event) =>
                  handleChange("business_name", event.target.value)
                }
                placeholder="Ej: Minimarket Don Jorge"
              />
            </label>

            <label>
              <span>RUT</span>
              <input
                type="text"
                value={form.rut}
                onChange={(event) => handleChange("rut", event.target.value)}
                placeholder="Ej: 12.345.678-9"
              />
            </label>

            <label>
              <span>Dirección</span>
              <input
                type="text"
                value={form.address}
                onChange={(event) =>
                  handleChange("address", event.target.value)
                }
                placeholder="Ej: Av. Principal 123"
              />
            </label>

            <label>
              <span>Teléfono</span>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="Ej: +56 9 1234 5678"
              />
            </label>

            <label>
              <span>Correo</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="Ej: contacto@minimarket.cl"
              />
            </label>

            <label>
              <span>Mensaje de pie de página</span>
              <input
                type="text"
                value={form.footer_message}
                onChange={(event) =>
                  handleChange("footer_message", event.target.value)
                }
                placeholder="Ej: Documento generado automáticamente por Minimarket POS"
              />
            </label>

            <div className="business-settings-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar configuración"}
              </button>
            </div>
          </form>
        </section>

        <section className="business-settings-preview">
          <h2>Vista previa</h2>

          <div className="business-preview-box">
            <strong>{form.business_name || "MINIMARKET POS"}</strong>

            <span>{form.rut || "RUT no configurado"}</span>
            <span>{form.address || "Dirección no configurada"}</span>
            <span>{form.phone || "Teléfono no configurado"}</span>
            <span>{form.email || "Correo no configurado"}</span>

            <small>
              {form.footer_message || "Mensaje de pie de página no configurado"}
            </small>
          </div>

          {settings?.updated_at && (
            <p className="business-settings-updated">
              Última actualización:{" "}
              {new Intl.DateTimeFormat("es-CL", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(settings.updated_at))}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
