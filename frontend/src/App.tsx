import { BrowserRouter, Routes, Route } from "react-router-dom";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import { Navbar } from "./components/Navbar";
import { DashboardLayout } from "./components/DashboardLayout";
import ProductsPage from "./features/products/pages/ProductsPage";
import AnalyticsPage from "./features/analytics/pages/AnalyticsPage";
import BulkRestockPage from "./features/bulk/pages/BulkRestockPage";
import BackupsPage from "./features/backups/pages/BackupsPage";
import ReportsPage from "./features/reports/pages/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<POS />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="bulk-restock" element={<BulkRestockPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="backups" element={<BackupsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
