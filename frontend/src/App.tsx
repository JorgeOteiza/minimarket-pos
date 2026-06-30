import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { DashboardLayout } from "./components/DashboardLayout";

const POS = lazy(() => import("./pages/POS"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductsPage = lazy(() => import("./features/products/pages/ProductsPage"));
const AnalyticsPage = lazy(() => import("./features/analytics/pages/AnalyticsPage"));
const BulkRestockPage = lazy(
  () => import("./features/bulk/pages/BulkRestockPage"),
);
const BackupsPage = lazy(() => import("./features/backups/pages/BackupsPage"));
const ReportsPage = lazy(() => import("./features/reports/pages/ReportsPage"));
const BusinessSettingsPage = lazy(
  () => import("./features/settings/pages/BusinessSettingsPage"),
);

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <>
        <Suspense fallback={<div className="page-loading">Cargando...</div>}>
          <Routes>
            <Route path="/" element={<POS />} />

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="bulk-restock" element={<BulkRestockPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="backups" element={<BackupsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<BusinessSettingsPage />} />
            </Route>
          </Routes>
        </Suspense>

        <footer className="app-footer">
          Hecho con <span className="footer-heart">❤</span>
        </footer>
      </>
    </BrowserRouter>
  );
}

export default App;
