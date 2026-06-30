import { Link } from "react-router-dom";

const sections = [
  {
    title: "Productos",
    description: "Mantén precios, stock mínimo, códigos de barra y ajustes.",
    to: "/dashboard/products",
  },
  {
    title: "Analytics",
    description: "Revisa ventas, productos destacados y estado de inventario.",
    to: "/dashboard/analytics",
  },
  {
    title: "Reportes",
    description: "Genera informes para revisar ventas y movimientos.",
    to: "/dashboard/reports",
  },
  {
    title: "Backups",
    description: "Crea, descarga o restaura respaldos locales de la base.",
    to: "/dashboard/backups",
  },
];

const Dashboard = () => {
  return (
    <section className="dashboard-home">
      <header className="dashboard-home-header">
        <div>
          <h1>Panel de administración</h1>

          <p>Operación local del minimarket</p>
        </div>

        <Link className="dashboard-home-primary" to="/">
          Ir a caja
        </Link>
      </header>

      <div className="dashboard-home-grid">
        {sections.map((section) => (
          <Link className="dashboard-home-card" key={section.to} to={section.to}>
            <span>{section.title}</span>
            <p>{section.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
