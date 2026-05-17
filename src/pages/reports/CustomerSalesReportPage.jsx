import { useEffect, useState } from "react";
import { reportsApi, customerApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import usePagination from "../../hooks/usePagination";
import { downloadCSV } from "../../utils/reportDownload";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

export default function CustomerSalesReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const threeMonthsAgo = new Date(
    new Date().setMonth(new Date().getMonth() - 3),
  )
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(threeMonthsAgo);
  const [endDate, setEndDate] = useState(today);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const ordersPagination = usePagination(report?.orders || [], 10);

  useEffect(() => {
    customerApi.getAll().then((r) => setCustomers(r.data.data));
  }, []);

  const handleGenerate = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    setLoading(true);
    try {
      const res = await reportsApi.getCustomerSalesReport(
        selectedCustomer,
        startDate,
        endDate,
      );
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
      "Status",
      "Items",
      "Total",
      "Invoice #",
      "Invoice Status",
    ];
    const rows = report.orders.map((o) => [
      o.orderNumber,
      o.orderDate,
      o.status,
      o.itemCount,
      o.totalAmount,
      o.invoiceNumber,
      o.invoiceStatus,
    ]);
    downloadCSV(
      [headers, ...rows],
      `Customer_Sales_${report.customerCode}_${startDate}_${endDate}.csv`,
    );
    toast.success("Report downloaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Customer Sales Report</h1>
        {report && (
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      {/* Customer Selector */}
      <div className="card mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Customer *
        </label>
        <select
          className="input-field max-w-sm"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">Choose customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.customerCode} — {c.name}
            </option>
          ))}
        </select>
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
          {/* Customer Info */}
          <div className="card mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 bg-amber-600 rounded-xl flex items-center
                justify-center text-white font-bold text-lg"
              >
                {report.customerName?.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  {report.customerName}
                </h2>
                <p className="text-sm text-gray-500">
                  {report.customerCode} | Period: {report.period}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              ["Total Orders", report.totalOrders, "text-blue-600"],
              [
                "Total Revenue",
                `₹${report.totalRevenue?.toFixed(2)}`,
                "text-green-600",
              ],
              [
                "Total Paid",
                `₹${report.totalPaid?.toFixed(2)}`,
                "text-green-600",
              ],
              [
                "Outstanding",
                `₹${report.totalOutstanding?.toFixed(2)}`,
                "text-red-600",
              ],
            ].map(([label, value, color]) => (
              <div key={label} className="card text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Top Products */}
          {report.topProducts?.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                Top Products Purchased
              </h2>
              <div className="space-y-3">
                {report.topProducts.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between
                    p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 bg-amber-600 text-white rounded-full
                        flex items-center justify-center text-xs font-bold"
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{p.productName}</p>
                        <p className="text-xs text-gray-500">{p.productSku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {p.quantityPurchased} units
                      </p>
                      <p className="text-xs text-green-600">
                        ₹{p.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-700">Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header">Order #</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Items</th>
                    <th className="table-header text-right">Total</th>
                    <th className="table-header">Invoice #</th>
                    <th className="table-header">Invoice Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersPagination.paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    ordersPagination.paginatedData.map((o, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-mono text-xs font-semibold">
                          {o.orderNumber}
                        </td>
                        <td className="table-cell">{o.orderDate}</td>
                        <td className="table-cell">
                          <span
                            className={
                              o.status === "CONFIRMED" ||
                              o.status === "DELIVERED"
                                ? "badge-green"
                                : o.status === "CANCELLED"
                                  ? "badge-red"
                                  : "badge-gray"
                            }
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="table-cell text-right">{o.itemCount}</td>
                        <td className="table-cell text-right font-semibold text-green-600">
                          ₹{o.totalAmount?.toFixed(2)}
                        </td>
                        <td className="table-cell font-mono text-xs">
                          {o.invoiceNumber}
                        </td>
                        <td className="table-cell">
                          <span
                            className={
                              o.invoiceStatus === "PAID"
                                ? "badge-green"
                                : o.invoiceStatus === "PARTIALLY_PAID"
                                  ? "badge-yellow"
                                  : o.invoiceStatus === "NO INVOICE"
                                    ? "badge-gray"
                                    : "badge-blue"
                            }
                          >
                            {o.invoiceStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={ordersPagination.currentPage}
              totalPages={ordersPagination.totalPages}
              totalItems={ordersPagination.totalItems}
              pageSize={ordersPagination.pageSize}
              onPageChange={ordersPagination.goToPage}
              hasNext={ordersPagination.hasNext}
              hasPrev={ordersPagination.hasPrev}
            />
          </div>
        </>
      )}
    </div>
  );
}
