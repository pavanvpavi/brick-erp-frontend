import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/endpoints";
import StatCard from "../../components/common/StatCard";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Sales KPIs */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Sales
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders}
          icon="⏳"
          color="amber"
        />
        <StatCard
          title="Total Sales"
          value={`₹${stats?.totalSalesAmount?.toFixed(2)}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="This Month"
          value={`₹${stats?.totalSalesThisMonth?.toFixed(2)}`}
          icon="📈"
          color="purple"
        />
      </div>

      {/* Inventory KPIs */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Inventory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts}
          icon="🧱"
          color="amber"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockItems}
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Warehouses"
          value={stats?.totalWarehouses}
          icon="🏭"
          color="blue"
        />
      </div>

      {/* Finance KPIs */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Finance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices}
          icon="🧾"
          color="blue"
        />
        <StatCard
          title="Unpaid Invoices"
          value={stats?.unpaidInvoices}
          icon="❌"
          color="red"
        />
        <StatCard
          title="Outstanding"
          value={`₹${stats?.totalOutstanding?.toFixed(2)}`}
          icon="💳"
          color="amber"
        />
        <StatCard
          title="Collected"
          value={`₹${stats?.totalCollected?.toFixed(2)}`}
          icon="✅"
          color="green"
        />
      </div>

      {/* Other KPIs */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Operations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Customers"
          value={stats?.totalCustomers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Suppliers"
          value={stats?.totalSuppliers}
          icon="🚚"
          color="purple"
        />
        <StatCard
          title="Active Production"
          value={stats?.activeProductionOrders}
          icon="🏗️"
          color="amber"
        />
        <StatCard
          title="Completed Production"
          value={stats?.completedProductionOrders}
          icon="✅"
          color="green"
        />
      </div>
    </div>
  );
}
