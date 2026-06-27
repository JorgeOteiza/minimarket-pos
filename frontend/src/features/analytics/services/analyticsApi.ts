import { buildApiUrl } from "../../../api/config";

export type AnalyticsSummary = {
  today: {
    sales_count: number;
    total_sales: number;
    average_ticket: number;
  };
  last_30_days: {
    sales_count: number;
    total_sales: number;
    average_ticket: number;
    total_units_sold: number;
    average_daily_sales: number;
  };
  inventory_alerts: {
    low_stock_count: number;
    products_without_price_count: number;
    products_without_movement_count: number;
    no_movement_days: number;
  };
  top_product: {
    id: number;
    name: string;
    quantity_sold: number;
    total_sold: number;
  } | null;
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
  products_without_movement: {
    id: number;
    name: string;
    barcode?: string | null;
    stock: number;
    price: number | null;
    last_sale_date: string | null;
  }[];
  top_products: {
    id: number;
    name: string;
    quantity_sold: number;
    total_sold: number;
  }[];
  profitable_products: {
    id: number;
    name: string;
    price: number;
    unit_cost_estimated: number;
    profit_per_unit: number;
    margin_percent: number;
    quantity_sold: number;
    total_sold: number;
    estimated_total_profit: number;
  }[];
  most_profitable_product: {
    id: number;
    name: string;
    price: number;
    unit_cost_estimated: number;
    profit_per_unit: number;
    margin_percent: number;
    quantity_sold: number;
    total_sold: number;
    estimated_total_profit: number;
  } | null;
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await fetch(buildApiUrl("/analytics/summary"));

  if (!res.ok) {
    throw new Error("Error cargando analytics");
  }

  return res.json();
};
