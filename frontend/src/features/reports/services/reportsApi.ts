import { buildApiUrl } from "../../../api/config";

export type ReportPeriod = "today" | "week" | "month" | "semester" | "year";

export type SalesReport = {
  period: {
    key: ReportPeriod;
    label: string;
    start_date: string;
    end_date: string;
  };
  summary: {
    sales_count: number;
    total_sales: number;
    average_ticket: number;
    total_units_sold: number;
  };
  top_products: {
    id: number;
    name: string;
    quantity_sold: number;
    total_sold: number;
  }[];
  recent_sales: {
    id: number;
    created_at: string | null;
    total_amount: number;
    items_count: number;
    items: {
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }[];
  }[];
};

export async function getSalesReport(
  period: ReportPeriod,
): Promise<SalesReport> {
  const res = await fetch(buildApiUrl(`/reports/sales?period=${period}`));

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Error cargando reporte de ventas");
  }

  return res.json();
}

export function getSalesReportPdfUrl(period: ReportPeriod): string {
  return buildApiUrl(`/reports/sales/pdf?period=${period}`);
}
