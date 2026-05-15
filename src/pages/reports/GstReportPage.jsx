import { useState } from "react";
import { reportsApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { FileText, Download } from "lucide-react";

export default function GstReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const pagination = usePagination(report?.invoices || [], 10);

  const handleLoad = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getGstReport(startDate, endDate);
      setReport(res.data.data);
    } catch {
      toast.error("Failed to load GST report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!report) return;
    const headers = [
      "Invoice #",
      "Date",
      "Customer",
      "GSTIN",
      "Taxable Value",
      "Tax Rate %",
      "CGST",
      "SGST",
      "IGST",
      "Total GST",
      "Invoice Value",
    ];
    const rows = report.invoices.map((inv) => [
      inv.invoiceNumber,
      inv.invoiceDate,
      inv.customerName,
      inv.customerGstin,
      inv.taxableValue,
      inv.taxRate,
      inv.cgst,
      inv.sgst,
      inv.igst,
      inv.totalGst,
      inv.invoiceValue,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GST_Report_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("GST Report downloaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">GST Report (GSTR-1)</h1>
        {report && (
          <button
            onClick={handleDownloadCsv}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        )}
      </div>

      {/* Date Filter */}
      <div className="card mb-6">
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {/* Quick period buttons */}
          <div className="flex gap-2">
            {["This Month", "Last Month", "This Quarter"].map((period) => (
              <button
                key={period}
                onClick={() => {
                  const now = new Date();
                  if (period === "This Month") {
                    setStartDate(
                      new Date(now.getFullYear(), now.getMonth(), 1)
                        .toISOString()
                        .split("T")[0],
                    );
                    setEndDate(now.toISOString().split("T")[0]);
                  } else if (period === "Last Month") {
                    setStartDate(
                      new Date(now.getFullYear(), now.getMonth() - 1, 1)
                        .toISOString()
                        .split("T")[0],
                    );
                    setEndDate(
                      new Date(now.getFullYear(), now.getMonth(), 0)
                        .toISOString()
                        .split("T")[0],
                    );
                  } else if (period === "This Quarter") {
                    const q = Math.floor(now.getMonth() / 3);
                    setStartDate(
                      new Date(now.getFullYear(), q * 3, 1)
                        .toISOString()
                        .split("T")[0],
                    );
                    setEndDate(now.toISOString().split("T")[0]);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100
                  text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
              >
                {period}
              </button>
            ))}
          </div>
          <button
            onClick={handleLoad}
            className="btn-primary flex items-center gap-2"
          >
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {report && !loading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              ["Total Invoices", report.totalInvoices, "text-blue-600"],
              [
                "Taxable Value",
                `₹${report.totalTaxableValue?.toFixed(2)}`,
                "text-gray-700",
              ],
              [
                "Total GST",
                `₹${report.totalGst?.toFixed(2)}`,
                "text-amber-600",
              ],
              [
                "Invoice Value",
                `₹${report.totalInvoiceValue?.toFixed(2)}`,
                "text-green-600",
              ],
            ].map(([label, value, color]) => (
              <div key={label} className="card text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* GST Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              ["CGST", report.totalCgst, "bg-blue-50 text-blue-700"],
              ["SGST", report.totalSgst, "bg-green-50 text-green-700"],
              ["IGST", report.totalIgst, "bg-purple-50 text-purple-700"],
            ].map(([label, value, cls]) => (
              <div key={label} className={`rounded-xl p-4 text-center ${cls}`}>
                <p className="text-2xl font-bold">₹{value?.toFixed(2)}</p>
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Invoice Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">
                Invoice Details — {report.period}
              </h2>
              <span className="text-sm text-gray-500">
                {report.invoices?.length} invoices
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="table-header">Invoice #</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">GSTIN</th>
                    <th className="table-header text-right">Taxable Value</th>
                    <th className="table-header text-right">Tax Rate</th>
                    <th className="table-header text-right">CGST</th>
                    <th className="table-header text-right">SGST</th>
                    <th className="table-header text-right">Total GST</th>
                    <th className="table-header text-right">Invoice Value</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-8 text-gray-400"
                      >
                        No invoices in this period
                      </td>
                    </tr>
                  ) : (
                    pagination.paginatedData.map((inv, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell font-mono text-xs font-semibold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="table-cell">{inv.invoiceDate}</td>
                        <td className="table-cell font-medium">
                          {inv.customerName}
                        </td>
                        <td className="table-cell font-mono text-xs">
                          {inv.customerGstin}
                        </td>
                        <td className="table-cell text-right">
                          ₹{inv.taxableValue?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right">
                          {inv.taxRate?.toFixed(1)}%
                        </td>
                        <td className="table-cell text-right">
                          ₹{inv.cgst?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right">
                          ₹{inv.sgst?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right font-semibold text-amber-600">
                          ₹{inv.totalGst?.toFixed(2)}
                        </td>
                        <td className="table-cell text-right font-semibold text-green-600">
                          ₹{inv.invoiceValue?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold border-t-2">
                    <td colSpan={4} className="table-cell">
                      Total
                    </td>
                    <td className="table-cell text-right">
                      ₹{report.totalTaxableValue?.toFixed(2)}
                    </td>
                    <td className="table-cell"></td>
                    <td className="table-cell text-right">
                      ₹{report.totalCgst?.toFixed(2)}
                    </td>
                    <td className="table-cell text-right">
                      ₹{report.totalSgst?.toFixed(2)}
                    </td>
                    <td className="table-cell text-right text-amber-600">
                      ₹{report.totalGst?.toFixed(2)}
                    </td>
                    <td className="table-cell text-right text-green-600">
                      ₹{report.totalInvoiceValue?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
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
