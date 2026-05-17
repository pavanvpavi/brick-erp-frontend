import { useState } from "react";
import { reportsApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import usePagination from "../../hooks/usePagination";
import { downloadCSV } from "../../utils/reportDownload";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

const STATUS_COLORS = {
  CONFIRMED: "badge-green",
  DRAFT: "badge-gray",
  DELIVERED: "badge-blue",
  CANCELLED: "badge-red",
  PROCESSING: "badge-yellow",
  SHIPPED: "badge-yellow",
};

export default function SalesReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const pagination = usePagination(report?.orders || [], 10);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getSalesReport(startDate, endDate);
      setReport(res.data.data);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const headers = [
      "Order #",
      "Date",
      "Customer",
      "Status",
      "Items",
      "Subtotal",
      "Tax",
      "Discount",
      "Total",
    ];
    const rows = report.orders.map((o) => [
      o.orderNumber,
      o.orderDate,
      o.customerName,
      o.status,
      o.itemCount,
      o.subtotal,
      o.taxAmount,
      o.discountAmount,
      o.totalAmount,
    ]);
    downloadCSV([headers, ...rows], `Sales_Report_${startDate}_${endDate}.csv`);
    toast.success("Report downloaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Sales Report</h1>
        {report && (
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onGenerate={handleGenerate}
        loading={loading}
      />

      {loading && <LoadingSpinner />}

      {report && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              ["Total Orders", report.totalOrders, "text-blue-600"],
              ["Confirmed", report.confirmedOrders, "text-green-600"],
              ["Cancelled", report.cancelledOrders, "text-red-600"],
              ["Items Sold", report.totalItemsSold, "text-amber-600"],
            ].map(([label, value, color]) => (
              <div key={label} className="card text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              [
                "Total Revenue",
                `₹${report.totalRevenue?.toFixed(2)}`,
                "text-green-600",
              ],
              [
                "Total Tax",
                `₹${report.totalTax?.toFixed(2)}`,
                "text-amber-600",
              ],
              [
                "Total Discount",
                `₹${report.totalDiscount?.toFixed(2)}`,
                "text-red-600",
              ],
              [
                "Net Revenue",
                `₹${report.netRevenue?.toFixed(2)}`,
                "text-blue-600",
              ],
            ].map(([label, value, color]) => (
              <div key={label} className="card text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Monthly Summary */}
          {report.monthlySummary?.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                Monthly Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="table-header">Month</th>
                      <th className="table-header text-right">Orders</th>
                      <th className="table-header text-right">Items Sold</th>
                      <th className="table-header text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlySummary.map((m, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-medium">{m.month}</td>
                        <td className="table-cell text-right">
                          {m.orderCount}
                        </td>
                        <td className="table-cell text-right">{m.itemsSold}</td>
                        <td className="table-cell text-right font-semibold text-green-600">
                          ₹{m.revenue?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Order Details</h2>
              <span className="text-sm text-gray-500">
                {report.orders?.length} orders
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header">Order #</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Items</th>
                    <th className="table-header text-right">Subtotal</th>
                    <th className="table-header text-right">Tax</th>
                    <th className="table-header text-right">Discount</th>
                    <th className="table-header text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-400"
                      >
                        No orders in this period
                      </td>
                    </tr>
                  ) : (
                    pagination.paginatedData.map((o, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-mono text-xs font-semibold">
                          {o.orderNumber}
                        </td>
                        <td className="table-cell">{o.orderDate}</td>
                        <td className="table-cell font-medium">
                          {o.customerName}
                        </td>
                        <td className="table-cell">
                          <span
                            className={STATUS_COLORS[o.status] || "badge-gray"}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="table-cell text-right">{o.itemCount}</td>
                        <td className="table-cell text-right">
                          ₹{o.subtotal?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right text-amber-600">
                          ₹{o.taxAmount?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right text-red-600">
                          ₹{o.discountAmount?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right font-semibold text-green-600">
                          ₹{o.totalAmount?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={pagination.goToPage}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          </div>
        </>
      )}
    </div>
  );
}
