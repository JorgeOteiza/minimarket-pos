import { Link, Outlet, useLocation } from "react-router-dom";

export const DashboardLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin</h2>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard/products"
            className={isActive("/dashboard/products") ? "active" : ""}
          >
            Productos
          </Link>

          <Link
            to="/dashboard/analytics"
            className={isActive("/dashboard/analytics") ? "active" : ""}
          >
            Analytics
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};
