import { useState } from "react";
import { ProductSearch } from "../../features/products/components/ProductSearch";
import { ProductForm } from "../../features/products/components/ProductForm";
import type { Product } from "../../features/products/types/product";

const Dashboard = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelectProduct = (product: Product) => {
    console.log("Producto seleccionado:", product);
    setSelectedProduct(product);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <ProductSearch onSelectProduct={handleSelectProduct} />

      {selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onUpdated={(updated) => {
            console.log("Producto actualizado:", updated);
            setSelectedProduct(updated); // 🔄 mantiene UI sincronizada
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
