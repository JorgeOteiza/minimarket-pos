import { useState } from "react";
import { ProductSearch } from "../components/ProductSearch";
import { ProductForm } from "../components/ProductForm";
import type { Product } from "../types/product";

const ProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div>
      <h1>Gestión de Productos</h1>

      <ProductSearch onSelectProduct={setSelectedProduct} />

      {selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onUpdated={(updated) => {
            setSelectedProduct(updated);
          }}
        />
      )}
    </div>
  );
};

export default ProductsPage;
