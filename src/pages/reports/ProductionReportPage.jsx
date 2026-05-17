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
  COMPLETED: "badge-green",
  IN_PROGRESS: "badge-yellow",
  PLANNED: "badge-gray",
  CANCELLED: "badge-red",
};

export default function ProductionReportPage() {
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

  const pagination = usePagination(report?.productionOrders || [], 10);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getProductionReport(startDate, endDate);
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
      "PRD #",
      "Product",
      "Status",
      "Planned Qty",
      "Produced Qty",
      "Start Date",
      "End Date",
    ];
    const rows = report.productionOrders.map((o) => [
      o.productionNumber,
      o.productName,
      o.status,
      o.plannedQuantity,
      o.producedQuantity,
      o.actualStartDate,
      o.actualEndDate,
    ]);
    downloadCSV(
      [headers, ...rows],
      `Production_Report_${startDate}_${endDate}.csv`,
    );
    toast.success("Report downloaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Production Report</h1>
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
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              ["Total Orders", report.totalProductionOrders, "text-blue-600"],
              ["Completed", report.completedOrders, "text-green-600"],
              ["In Progress", report.inProgressOrders, "text-yellow-600"],
              ["Cancelled", report.cancelledOrders, "text-red-600"],
            ].map(([label, value, color]) => (
              <div key={label} className="card text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-700">
                {report.totalPlannedQuantity}
              </p>
              <p className="text-sm text-gray-500">Planned Quantity</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">
                {report.totalProducedQuantity}
              </p>
              <p className="text-sm text-gray-500">Produced Quantity</p>
            </div>
            <div className="card text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-amber-600">
                  {report.completionRate}%
                </p>
              </div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(report.completionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Product Summary */}
          {report.productSummary?.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                Production by Product
              </h2>
              <div className="space-y-3">
                {report.productSummary.map((p, i) => (
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
                      <p className="font-medium text-sm">{p.productName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{p.totalProduced} units</p>
                      <p className="text-xs text-gray-500">
                        {p.orderCount} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Production Orders Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Production Orders</h2>
              <span className="text-sm text-gray-500">
                {report.productionOrders?.length} orders
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header">PRD #</th>
                    <th className="table-header">Product</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Planned</th>
                    <th className="table-header text-right">Produced</th>
                    <th className="table-header">Start Date</th>
                    <th className="table-header">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        No production orders in this period
                      </td>
                    </tr>
                  ) : (
                    pagination.paginatedData.map((o, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-mono text-xs font-semibold">
                          {o.productionNumber}
                        </td>
                        <td className="table-cell font-medium">
                          {o.productName}
                        </td>
                        <td className="table-cell">
                          <span
                            className={STATUS_COLORS[o.status] || "badge-gray"}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="table-cell text-right">
                          {o.plannedQuantity}
                        </td>
                        <td className="table-cell text-right font-semibold text-green-600">
                          {o.producedQuantity}
                        </td>
                        <td className="table-cell">{o.actualStartDate}</td>
                        <td className="table-cell">{o.actualEndDate}</td>
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
