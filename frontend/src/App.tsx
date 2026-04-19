import { BrowserRouter, Routes, Route } from "react-router-dom";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import { Navbar } from "./components/Navbar";
import { DashboardLayout } from "./components/DashboardLayout";
import ProductsPage from "./features/products/pages/ProductsPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<POS />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="analytics" element={<div>Analytics próximamente</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
