import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
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
  CheckCircle,
  Clock,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, bg, subtext }) => (
  <div
    className="card flex items-center gap-4 hover:shadow-md
    transition-shadow"
  >
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
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          label="Production Orders"
          value={stats?.totalProductionOrders}
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Orders Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ShoppingCart size={16} className="text-purple-600" />
            Orders Overview
          </h3>
          <div className="space-y-3">
            {[
              ["Confirmed", stats?.confirmedOrders, "bg-green-500"],
              ["Pending", stats?.pendingOrders, "bg-yellow-500"],
              ["Delivered", stats?.deliveredOrders, "bg-blue-500"],
              ["Cancelled", stats?.cancelledOrders, "bg-red-500"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {value ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Receipt size={16} className="text-amber-600" />
            Invoice Overview
          </h3>
          <div className="space-y-3">
            {[
              ["Paid", stats?.paidInvoices, "bg-green-500"],
              ["Partially Paid", stats?.partiallyPaidInvoices, "bg-yellow-500"],
              ["Sent", stats?.sentInvoices, "bg-blue-500"],
              ["Overdue", stats?.overdueInvoices, "bg-red-500"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {value ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" />
            Revenue Overview
          </h3>
          <div className="space-y-3">
            {[
              [
                "Total Revenue",
                `₹${stats?.totalRevenue?.toFixed(2) ?? "0.00"}`,
              ],
              ["Collected", `₹${stats?.totalCollected?.toFixed(2) ?? "0.00"}`],
              [
                "Outstanding",
                `₹${stats?.totalOutstanding?.toFixed(2) ?? "0.00"}`,
              ],
              [
                "This Month",
                `₹${stats?.revenueThisMonth?.toFixed(2) ?? "0.00"}`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats?.lowStockCount > 0 || stats?.overdueInvoices > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.lowStockCount > 0 && (
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
                  {stats.lowStockCount} product(s) below minimum stock level
                </p>
              </div>
            </div>
          )}
          {stats?.overdueInvoices > 0 && (
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
                  Overdue Invoices
                </p>
                <p className="text-amber-600 text-xs mt-0.5">
                  {stats.overdueInvoices} invoice(s) are past due date
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
