import { Link, Outlet, useLocation } from "react-router-dom";

export const DashboardLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Menú</h2>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <span className="sidebar-section-title">Gestión diaria</span>

            <Link
              to="/dashboard/products"
              className={isActive("/dashboard/products") ? "active" : ""}
            >
              Productos
            </Link>

            <Link
              to="/dashboard/bulk-restock"
              className={isActive("/dashboard/bulk-restock") ? "active" : ""}
            >
              Reposición de sacos y paquetes
            </Link>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Información comercial</span>

            <Link
              to="/dashboard/reports"
              className={isActive("/dashboard/reports") ? "active" : ""}
            >
              Reportes de ventas
            </Link>

            <Link
              to="/dashboard/analytics"
              className={isActive("/dashboard/analytics") ? "active" : ""}
            >
              Análisis de datos
            </Link>
          </div>

          <div className="sidebar-section sidebar-section-system">
            <span className="sidebar-section-title">Sistema</span>

            <Link
              to="/dashboard/backups"
              className={isActive("/dashboard/backups") ? "active" : ""}
            >
              Respaldos
            </Link>

            <Link
              to="/dashboard/settings"
              className={isActive("/dashboard/settings") ? "active" : ""}
            >
              Configuración del negocio
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
