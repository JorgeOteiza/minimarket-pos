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

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h2>Ventas por día</h2>
        <p>Evolución de ventas de los últimos 30 días.</p>
      </div>

      <div className="analytics-chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" tickFormatter={formatDate} />

            <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />

            <Tooltip
              formatter={(value) => formatCLP(Number(value))}
              labelFormatter={(label) => `Fecha: ${formatDate(String(label))}`}
            />

            <Line
              type="monotone"
              dataKey="total_sales"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
