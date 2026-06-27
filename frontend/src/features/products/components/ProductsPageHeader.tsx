type Props = {
  onAddProduct: () => void;
};

const ProductsPageHeader = ({ onAddProduct }: Props) => {
  return (
    <div className="products-header">
      <div>
        <h1>Gestión de Productos</h1>
        <p>Administra costos, precios, stock e inventario.</p>
      </div>

      <button className="add-product-button" onClick={onAddProduct}>
        + Agregar producto
      </button>
    </div>
  );
};

export default ProductsPageHeader;
