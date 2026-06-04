import { BrowserRouter, Routes, Route } from "react-router-dom";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import { Navbar } from "./components/Navbar";
import { DashboardLayout } from "./components/DashboardLayout";
import ProductsPage from "./features/products/pages/ProductsPage";
import AnalyticsPage from "./features/analytics/pages/AnalyticsPage";
import BulkRestockPage from "./features/bulk/pages/BulkRestockPage";

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
