import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TopProduct = {
  id: number;
  name: string;
  quantity_sold: number;
  total_sold: number;
};

type Props = {
  data: TopProduct[];
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export default function TopProductsChart({ data }: Props) {
  const chartData = data.slice(0, 8);

  if (!chartData.length) {
    return (
      <div className="analytics-chart-card">
        <div className="analytics-chart-header">
          <h2>Productos más vendidos</h2>
          <p>No hay ventas registradas para graficar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h2>Productos más vendidos</h2>
        <p>Ranking por unidades vendidas.</p>
      </div>

      <div className="analytics-chart-container analytics-chart-container-tall">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" allowDecimals={false} />

            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(value, name) => {
                if (name === "quantity_sold") {
                  return [`${value} unidades`, "Unidades vendidas"];
                }

                return [formatCLP(Number(value)), "Total vendido"];
              }}
            />

            <Bar dataKey="quantity_sold" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
