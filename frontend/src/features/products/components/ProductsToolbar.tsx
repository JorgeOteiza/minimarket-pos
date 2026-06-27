type SortMode = "name_asc" | "name_desc" | "price_asc" | "price_desc";

type Props = {
  query: string;
  sortMode: SortMode;
  perPage: number;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onPerPageChange: (value: number) => void;
};

const ProductsToolbar = ({
  query,
  sortMode,
  perPage,
  onQueryChange,
  onSortChange,
  onPerPageChange,
}: Props) => {
  return (
    <div className="products-toolbar">
      <input
        type="text"
        placeholder="Buscar por nombre o código..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className="products-search"
      />

      <div className="products-toolbar-controls">
        <label>
          Ordenar
          <select
            value={sortMode}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
          >
            <option value="name_asc">Nombre A-Z</option>
            <option value="name_desc">Nombre Z-A</option>
            <option value="price_desc">Precio mayor a menor</option>
            <option value="price_asc">Precio menor a mayor</option>
          </select>
        </label>

        <label>
          Mostrar
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default ProductsToolbar;
