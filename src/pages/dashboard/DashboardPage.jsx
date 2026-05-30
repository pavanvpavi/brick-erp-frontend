import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  MonthlyRevenueChart,
  MonthlyOrdersChart,
  TopProductsChart,
  StockLevelsChart,
} from "../../components/common/Charts";
import toast from "react-hot-toast";
import {
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Factory,
  DollarSign,
  Truck,
  Clock,
  BarChart2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const testData = [
  { month: 'Jan', revenue: 1000 },
  { month: 'Feb', revenue: 2000 },
  { month: 'Mar', revenue: 1500 },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ padding: 20 }}>Dashboard Test</h1>
      <div style={{ width: '100%', height: 300, padding: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={testData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Bar dataKey="revenue" fill="#d97706" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card flex items-center gap-4 hover:shadow-md transition-shadow">
    <div
      className={`w-12 h-12 rounded-xl flex items-center
      justify-center flex-shrink-0 ${bg}`}
    >
      <Icon size={22} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-gray-800 leading-tight">
        {value ?? "—"}
      </p>
      <p className="text-sm text-gray-500 truncate">{label}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      {/* Alerts */}
      {(stats?.lowStockItems > 0 || stats?.unpaidInvoices > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.lowStockItems > 0 && (
            <div
              className="bg-red-50 border border-red-200 rounded-xl p-4
              flex items-start gap-3"
            >
              <AlertTriangle
                size={18}
                className="text-red-500 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-red-800 text-sm">
                  Low Stock Alert
                </p>
                <p className="text-red-600 text-xs mt-0.5">
                  {stats.lowStockItems} product(s) below minimum stock level
                </p>
              </div>
            </div>
          )}
          {stats?.unpaidInvoices > 0 && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-xl p-4
              flex items-start gap-3"
            >
              <Clock
                size={18}
                className="text-amber-500 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  Unpaid Invoices
                </p>
                <p className="text-amber-600 text-xs mt-0.5">
                  {stats.unpaidInvoices} invoice(s) are pending payment
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={Users}
          label="Active Customers"
          value={stats?.activeCustomers}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          icon={Receipt}
          label="Total Invoices"
          value={stats?.totalInvoices}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Warehouse}
          label="Warehouses"
          value={stats?.totalWarehouses}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={Truck}
          label="Suppliers"
          value={stats?.totalSuppliers}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <StatCard
          icon={Factory}
          label="Active Production"
          value={stats?.activeProductionOrders}
          color="text-teal-600"
          bg="bg-teal-50"
        />
        <StatCard
          icon={DollarSign}
          label="Pending POs"
          value={stats?.pendingPurchaseOrders}
          color="text-pink-600"
          bg="bg-pink-50"
        />
      </div>

      {/* Revenue + Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-amber-600" />
            <h2 className="font-semibold text-gray-700">
              Monthly Revenue (Last 6 Months)
            </h2>
          </div>
          <MonthlyRevenueChart data={stats?.monthlyRevenue} />
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">
              Monthly Orders (Last 6 Months)
            </h2>
          </div>
          <MonthlyOrdersChart data={stats?.monthlyRevenue} />
        </div>
      </div>

      {/* Top Products + Stock Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-green-600" />
            <h2 className="font-semibold text-gray-700">
              Top Products by Sales
            </h2>
          </div>
          <TopProductsChart data={stats?.topProducts} />
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-semibold text-gray-700">Low Stock Levels</h2>
          </div>
          <StockLevelsChart data={stats?.stockLevels} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales Summary */}
        <div className="card">
          <h3
            className="font-semibold text-gray-700 mb-4
            flex items-center gap-2"
          >
            <ShoppingCart size={16} className="text-purple-600" />
            Sales Summary
          </h3>
          <div className="space-y-3">
            {[
              ["Total Orders", stats?.totalOrders ?? 0],
              ["Confirmed", stats?.confirmedOrders ?? 0],
              ["Pending", stats?.pendingOrders ?? 0],
              ["Completed Production", stats?.completedProductionOrders ?? 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between
                  py-1 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Summary */}
        <div className="card">
          <h3
            className="font-semibold text-gray-700 mb-4
            flex items-center gap-2"
          >
            <Receipt size={16} className="text-amber-600" />
            Finance Summary
          </h3>
          <div className="space-y-3">
            {[
              ["Total Invoices", stats?.totalInvoices ?? 0],
              ["Unpaid", stats?.unpaidInvoices ?? 0],
              ["Collected", `₹${stats?.totalCollected?.toFixed(2) ?? "0.00"}`],
              [
                "Outstanding",
                `₹${stats?.totalOutstanding?.toFixed(2) ?? "0.00"}`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between
                  py-1 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="card">
          <h3
            className="font-semibold text-gray-700 mb-4
            flex items-center gap-2"
          >
            <TrendingUp size={16} className="text-green-600" />
            Revenue Summary
          </h3>
          <div className="space-y-3">
            {[
              [
                "Total Revenue",
                `₹${stats?.totalSalesAmount?.toFixed(2) ?? "0.00"}`,
              ],
              [
                "This Month",
                `₹${stats?.totalSalesThisMonth?.toFixed(2) ?? "0.00"}`,
              ],
              [
                "Total Collected",
                `₹${stats?.totalCollected?.toFixed(2) ?? "0.00"}`,
              ],
              [
                "Outstanding",
                `₹${stats?.totalOutstanding?.toFixed(2) ?? "0.00"}`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between
                  py-1 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
