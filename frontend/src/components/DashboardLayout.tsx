import { Link, Outlet, useLocation } from "react-router-dom";

export const DashboardLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">MENÚ</h2>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <span className="sidebar-section-title">Gestión diaria</span>

            <Link
              to="/dashboard/products"
              className={isActive("/dashboard/products") ? "active" : ""}
            >
              PRODUCTOS
            </Link>

            <Link
              to="/dashboard/bulk-restock"
              className={isActive("/dashboard/bulk-restock") ? "active" : ""}
            >
              REPOSICIÓN DE SACOS Y PAQUETES
            </Link>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Información comercial</span>

            <Link
              to="/dashboard/reports"
              className={isActive("/dashboard/reports") ? "active" : ""}
            >
              REPORTES DE VENTAS
            </Link>

            <Link
              to="/dashboard/analytics"
              className={isActive("/dashboard/analytics") ? "active" : ""}
            >
              ANÁLISIS DE DATOS
            </Link>
          </div>

          <div className="sidebar-section sidebar-section-system">
            <span className="sidebar-section-title">Sistema</span>

            <Link
              to="/dashboard/backups"
              className={isActive("/dashboard/backups") ? "active" : ""}
            >
              RESPALDOS
            </Link>

            <Link
              to="/dashboard/settings"
              className={isActive("/dashboard/settings") ? "active" : ""}
            >
              AJUSTES DEL NEGOCIO
            </Link>
          </div>
        </nav>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};
