const COLORS = [
  "#d97706",
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

const EmptyState = ({ message = "No data available" }) => (
  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
    {message}
  </div>
);

// Simple Bar Chart using pure CSS
export function MonthlyRevenueChart({ data }) {
  if (!data || data.length === 0 || !data.some((d) => d.revenue > 0))
    return <EmptyState message="No revenue data yet" />;

  const max = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="space-y-2 pt-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
            {item.month}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full flex items-center
                justify-end pr-2 transition-all duration-500"
              style={{
                width: `${max > 0 ? (item.revenue / max) * 100 : 0}%`,
                minWidth: item.revenue > 0 ? "2rem" : "0",
              }}
            >
              {item.revenue > 0 && (
                <span className="text-xs text-white font-medium">
                  ₹
                  {item.revenue >= 1000
                    ? `${(item.revenue / 1000).toFixed(0)}k`
                    : item.revenue}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Orders Line Chart using pure CSS
export function MonthlyOrdersChart({ data }) {
  if (!data || data.length === 0 || !data.some((d) => d.orders > 0))
    return <EmptyState message="No orders data yet" />;

  const max = Math.max(...data.map((d) => d.orders));

  return (
    <div className="space-y-2 pt-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
            {item.month}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full flex items-center
                justify-end pr-2 transition-all duration-500"
              style={{
                width: `${max > 0 ? (item.orders / max) * 100 : 0}%`,
                minWidth: item.orders > 0 ? "2rem" : "0",
              }}
            >
              {item.orders > 0 && (
                <span className="text-xs text-white font-medium">
                  {item.orders}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Top Products horizontal bar chart
export function TopProductsChart({ data }) {
  if (!data || data.length === 0)
    return <EmptyState message="No sales data yet" />;

  const max = Math.max(...data.map((d) => d.quantity));

  return (
    <div className="space-y-3 pt-2">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 truncate max-w-[60%]">
              {item.name}
            </span>
            <span className="text-xs text-gray-500">
              {item.quantity?.toLocaleString("en-IN")} units
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${max > 0 ? (item.quantity / max) * 100 : 0}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Stock Levels comparison chart
export function StockLevelsChart({ data }) {
  if (!data || data.length === 0)
    return (
      <div
        className="flex items-center justify-center h-48
        text-green-600 text-sm font-medium"
      >
        ✅ All products have sufficient stock
      </div>
    );

  const max = Math.max(...data.flatMap((d) => [d.current, d.minimum]));

  return (
    <div className="space-y-3 pt-2">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 truncate max-w-[60%]">
              {item.product}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-amber-600">Current: {item.current}</span>
              <span className="text-red-500">Min: {item.minimum}</span>
            </div>
          </div>
          <div className="flex gap-1 h-3">
            <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${max > 0 ? (item.current / max) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{
                  width: `${max > 0 ? (item.minimum / max) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-gray-500">Current Stock</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-xs text-gray-500">Min Required</span>
        </div>
      </div>
    </div>
  );
}

// Pie Chart using CSS
export function RevenuePieChart({ data }) {
  if (!data || data.length === 0) return <EmptyState />;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-2 pt-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
          <span className="text-xs text-gray-600 flex-1 truncate">
            {item.name}
          </span>
          <span className="text-xs font-semibold text-gray-800">
            ₹{Number(item.value).toFixed(0)}
          </span>
          <span className="text-xs text-gray-400 w-10 text-right">
            {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
          </span>
          <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
