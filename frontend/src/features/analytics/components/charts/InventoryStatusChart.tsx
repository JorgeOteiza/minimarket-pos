import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Props = {
  lowStockCount: number;
  productsWithoutPriceCount: number;
};

export default function InventoryStatusChart({
  lowStockCount,
  productsWithoutPriceCount,
}: Props) {
  const data = [
    {
      name: "Stock bajo",
      value: lowStockCount,
    },
    {
      name: "Sin precio",
      value: productsWithoutPriceCount,
    },
  ].filter((item) => item.value > 0);

  if (!data.length) {
    return (
      <div className="analytics-chart-card">
        <div className="analytics-chart-header">
          <h2>Alertas de inventario</h2>
          <p>No hay alertas activas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <h2>Alertas de inventario</h2>
        <p>Productos que requieren revisión administrativa.</p>
      </div>

      <div className="analytics-chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              label
            >
              {data.map((item) => (
                <Cell key={item.name} />
              ))}
            </Pie>

            <Tooltip formatter={(value) => [`${value}`, "Cantidad"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
