import { useEffect, useState } from "react";
import { reportsApi, productApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import usePagination from "../../hooks/usePagination";
import { downloadCSV } from "../../utils/reportDownload";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

export default function ProductSalesReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const threeMonthsAgo = new Date(
    new Date().setMonth(new Date().getMonth() - 3),
  )
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(threeMonthsAgo);
  const [endDate, setEndDate] = useState(today);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const salesPagination = usePagination(report?.salesHistory || [], 10);

  useEffect(() => {
    productApi.getAll().then((r) => setProducts(r.data.data));
  }, []);

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    setLoading(true);
    try {
      const res = await reportsApi.getProductSalesReport(
        selectedProduct,
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
      "Customer",
      "Quantity",
      "Unit Price",
      "Discount",
      "Line Total",
    ];
    const rows = report.salesHistory.map((s) => [
      s.orderNumber,
      s.orderDate,
      s.customerName,
      s.quantity,
      s.unitPrice,
      s.discountAmount,
      s.lineTotal,
    ]);
    downloadCSV(
      [headers, ...rows],
      `Product_Sales_${report.productSku}_${startDate}_${endDate}.csv`,
    );
    toast.success("Report downloaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Product Sales Report</h1>
        {report && (
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      <div className="card mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Product *
        </label>
        <select
          className="input-field max-w-sm"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Choose product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name}
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
          {/* Product Info */}
          <div className="card mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  {report.productName}
                </h2>
                <p className="text-sm text-gray-500">
                  SKU: {report.productSku} | Period: {report.period}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              ["Total Qty Sold", report.totalQuantitySold, "text-blue-600"],
              [
                "Total Revenue",
                `₹${report.totalRevenue?.toFixed(2)}`,
                "text-green-600",
              ],
              [
                "Avg Selling Price",
                `₹${report.averageSellingPrice?.toFixed(2)}`,
                "text-amber-600",
              ],
              [
                "Gross Profit",
                `₹${report.grossProfit?.toFixed(2)}`,
                report.grossProfit >= 0 ? "text-green-600" : "text-red-600",
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
                Monthly Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="table-header">Month</th>
                      <th className="table-header text-right">Qty Sold</th>
                      <th className="table-header text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlySummary.map((m, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-medium">{m.month}</td>
                        <td className="table-cell text-right">
                          {m.quantitySold}
                        </td>
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

          {/* Sales History Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Sales History</h2>
              <span className="text-sm text-gray-500">
                {report.salesHistory?.length} transactions
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header">Order #</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header text-right">Qty</th>
                    <th className="table-header text-right">Unit Price</th>
                    <th className="table-header text-right">Discount</th>
                    <th className="table-header text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesPagination.paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        No sales in this period
                      </td>
                    </tr>
                  ) : (
                    salesPagination.paginatedData.map((s, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-mono text-xs font-semibold">
                          {s.orderNumber}
                        </td>
                        <td className="table-cell">{s.orderDate}</td>
                        <td className="table-cell font-medium">
                          {s.customerName}
                        </td>
                        <td className="table-cell text-right font-semibold">
                          {s.quantity}
                        </td>
                        <td className="table-cell text-right">
                          ₹{s.unitPrice?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right text-red-600">
                          ₹{s.discountAmount?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right font-semibold text-green-600">
                          ₹{s.lineTotal?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={salesPagination.currentPage}
              totalPages={salesPagination.totalPages}
              totalItems={salesPagination.totalItems}
              pageSize={salesPagination.pageSize}
              onPageChange={salesPagination.goToPage}
              hasNext={salesPagination.hasNext}
              hasPrev={salesPagination.hasPrev}
            />
          </div>
        </>
      )}
    </div>
  );
}
