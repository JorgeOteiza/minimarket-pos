import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesByDay = {
  date: string;
  total_sales: number;
  sales_count: number;
};

type Props = {
  data: SalesByDay[];
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatDate = (date: string) => {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
};

export default function SalesChart({ data }: Props) {
  if (!data.length) {
    return <p>No hay ventas suficientes para graficar.</p>;
  }

  const totalPeriodSales = data.reduce(
    (total, item) => total + item.total_sales,
    0,
  );

  const totalPeriodTransactions = data.reduce(
    (total, item) => total + item.sales_count,
    0,
  );

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div>
          <h2>Ventas por día</h2>
          <p>Evolución de ventas de los últimos 30 días.</p>
        </div>

        <div className="analytics-chart-summary">
          <span>Total del periodo</span>
          <strong>{formatCLP(totalPeriodSales)}</strong>
          <small>{totalPeriodTransactions} ventas registradas</small>
        </div>
      </div>

      <div className="analytics-chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 12, right: 28, left: 8 }}>
            <CartesianGrid stroke="#dbeafe" strokeDasharray="4 4" />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "#334155", fontSize: 16, fontWeight: 800 }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />

            <YAxis
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
              tick={{ fill: "#334155", fontSize: 16, fontWeight: 800 }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #86efac",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.16)",
                fontSize: 18,
                fontWeight: 800,
              }}
              formatter={(value) => formatCLP(Number(value))}
              labelFormatter={(label) => `Fecha: ${formatDate(String(label))}`}
            />

            <Line
              type="monotone"
              dataKey="total_sales"
              name="Total vendido"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 5, fill: "#16a34a", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{
                r: 8,
                fill: "#15803d",
                stroke: "#bbf7d0",
                strokeWidth: 4,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
