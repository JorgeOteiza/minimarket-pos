const API_URL = "http://localhost:5000/api";

export type AnalyticsSummary = {
  today: {
    sales_count: number;
    total_sales: number;
  };
  last_30_days: {
    sales_count: number;
    total_sales: number;
  };
  sales_by_day: {
    date: string;
    total_sales: number;
    sales_count: number;
  }[];
  low_stock_products: {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
  }[];
  products_without_price: {
    id: number;
    name: string;
    barcode?: string | null;
  }[];
  top_products: {
    id: number;
    name: string;
    quantity_sold: number;
    total_sold: number;
  }[];
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await fetch(`${API_URL}/analytics/summary`);

  if (!res.ok) {
    throw new Error("Error cargando analytics");
  }

  return res.json();
};
