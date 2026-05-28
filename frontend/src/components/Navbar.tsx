import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">MINIMARKET GOGI</span>
      </div>

      <div className="navbar-right">
        <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>
          Punto de venta
        </Link>

        <Link
          to="/dashboard/products"
          className={
            location.pathname.startsWith("/dashboard")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Administración
        </Link>
      </div>
    </nav>
  );
};
