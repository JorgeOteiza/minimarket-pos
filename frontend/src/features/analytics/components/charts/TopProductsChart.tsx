import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

const BAR_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#475569",
];

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
        <p>Ranking por unidades vendidas en los últimos 30 días.</p>
      </div>

      <div className="analytics-chart-container analytics-chart-container-tall">
        <ResponsiveContainer width="100%" height={520}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

            <XAxis
              type="number"
              allowDecimals={false}
              tick={{
                fontSize: 18,
                fontWeight: 700,
                fill: "#334155",
              }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={260}
              tick={{
                fontSize: 18,
                fontWeight: 800,
                fill: "#0f172a",
              }}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
            />

            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #bfdbfe",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.16)",
                fontSize: 18,
                fontWeight: 800,
              }}
              formatter={(value, name) => {
                if (name === "quantity_sold") {
                  return [`${value} unidades`, "Unidades vendidas"];
                }

                return [formatCLP(Number(value)), "Total vendido"];
              }}
            />

            <Bar dataKey="quantity_sold" radius={[0, 10, 10, 0]}>
              {chartData.map((product, index) => (
                <Cell
                  key={product.id}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}

              <LabelList
                dataKey="quantity_sold"
                position="right"
                formatter={(value: number) => `${value}`}
                style={{
                  fill: "#0f172a",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
