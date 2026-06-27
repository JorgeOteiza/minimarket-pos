type Props = {
  page: number;
  totalPages: number;
  totalProducts: number;
  perPage: number;
  onPerPageChange: (value: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const ProductsPagination = ({
  page,
  totalPages,
  totalProducts,
  perPage,
  onPerPageChange,
  onPreviousPage,
  onNextPage,
}: Props) => {
  return (
    <div className="products-pagination">
      <span>
        Mostrando página {page} de {totalPages} · {totalProducts} productos
      </span>

      <div className="pagination-controls">
        <select
          value={perPage}
          onChange={(event) => onPerPageChange(Number(event.target.value))}
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={300}>300</option>
        </select>

        <button type="button" disabled={page <= 1} onClick={onPreviousPage}>
          Anterior
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNextPage}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ProductsPagination;
