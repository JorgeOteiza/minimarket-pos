import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      <p>Bienvenido al panel de administración.</p>

      <div style={{ marginTop: "20px" }}>
        <p>Desde aquí puedes:</p>

        <ul>
          <li>
            <Link to="/dashboard/products">Ir a productos</Link>
          </li>
          <li>
            <Link to="/dashboard/analytics">Ver analytics</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
