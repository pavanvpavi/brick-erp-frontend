import { useState } from "react";
import { reportsApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import { downloadCSV } from "../../utils/reportDownload";
import toast from "react-hot-toast";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

export default function ProfitLossReportPage() {
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

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getProfitLossReport(startDate, endDate);
      setReport(res.data.data);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const data = [
      ["Profit & Loss Report", report.period],
      [],
      ["REVENUE"],
      ["Total Revenue", report.totalRevenue],
      ["Tax Collected", report.totalTaxCollected],
      ["Discount Given", report.totalDiscountGiven],
      ["Net Revenue", report.netRevenue],
      [],
      ["COST OF GOODS SOLD"],
      ["COGS", report.costOfGoodsSold],
      ["Gross Profit", report.grossProfit],
      ["Gross Profit Margin", `${report.grossProfitMargin}%`],
      [],
      ["EXPENSES"],
      ...(report.expenseBreakdown?.map((e) => [
        e.category,
        e.amount,
        `${e.percentage}%`,
      ]) || []),
      ["Total Expenses", report.totalExpenses],
      [],
      ["NET PROFIT", report.netProfit],
      ["Net Profit Margin", `${report.netProfitMargin}%`],
    ];
    downloadCSV(data, `PL_Report_${startDate}_${endDate}.csv`);
    toast.success("P&L Report downloaded");
  };

  const isProfit = report?.netProfit >= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Profit & Loss Report</h1>
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
        <div className="space-y-6">
          {/* Net Profit Banner */}
          <div
            className={`rounded-xl p-6 text-center ${
              isProfit
                ? "bg-green-50 border-2 border-green-200"
                : "bg-red-50 border-2 border-red-200"
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              {isProfit ? (
                <TrendingUp size={32} className="text-green-600" />
              ) : (
                <TrendingDown size={32} className="text-red-600" />
              )}
              <p
                className={`text-4xl font-bold ${
                  isProfit ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{report.netProfit?.toFixed(2)}
              </p>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {isProfit ? "Net Profit" : "Net Loss"} — {report.period}
            </p>
            <p
              className={`text-sm mt-1 ${
                isProfit ? "text-green-600" : "text-red-600"
              }`}
            >
              {report.netProfitMargin?.toFixed(1)}% margin
            </p>
          </div>

          {/* Revenue Section */}
          <div className="card">
            <h2 className="font-bold text-gray-700 text-lg mb-4 pb-2 border-b">
              💰 Revenue
            </h2>
            <div className="space-y-3">
              {[
                [
                  "Total Revenue (incl. tax)",
                  report.totalRevenue,
                  "text-gray-800",
                ],
                [
                  "(-) Tax Collected",
                  report.totalTaxCollected,
                  "text-amber-600",
                ],
                [
                  "(-) Discount Given",
                  report.totalDiscountGiven,
                  "text-red-500",
                ],
                [
                  "= Net Revenue",
                  report.netRevenue,
                  "text-green-600 font-bold text-lg",
                ],
              ].map(([label, value, cls]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2
                  border-b border-gray-100 last:border-0 last:pt-2"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm ${cls}`}>₹{value?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COGS Section */}
          <div className="card">
            <h2 className="font-bold text-gray-700 text-lg mb-4 pb-2 border-b">
              🧱 Cost of Goods Sold
            </h2>
            <div className="space-y-3">
              {[
                ["Net Revenue", report.netRevenue, "text-green-600"],
                [
                  "(-) Cost of Goods Sold",
                  report.costOfGoodsSold,
                  "text-red-500",
                ],
                [
                  "= Gross Profit",
                  report.grossProfit,
                  report.grossProfit >= 0
                    ? "text-green-600 font-bold text-lg"
                    : "text-red-600 font-bold text-lg",
                ],
              ].map(([label, value, cls]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2
                  border-b border-gray-100 last:border-0 last:pt-2"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm ${cls}`}>₹{value?.toFixed(2)}</span>
                </div>
              ))}
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between">
                <span className="text-sm text-gray-600">
                  Gross Profit Margin
                </span>
                <span
                  className={`font-semibold ${
                    report.grossProfitMargin >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {report.grossProfitMargin?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="card">
            <h2 className="font-bold text-gray-700 text-lg mb-4 pb-2 border-b">
              📊 Expenses
            </h2>
            {report.expenseBreakdown?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No expenses recorded in this period
              </p>
            ) : (
              <div className="space-y-3">
                {report.expenseBreakdown?.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2
                    border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {e.category?.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({e.percentage?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-red-400 h-1.5 rounded-full"
                          style={{ width: `${e.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-500 w-24 text-right">
                        ₹{e.amount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-semibold">
                  <span>Total Expenses</span>
                  <span className="text-red-600">
                    ₹{report.totalExpenses?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Net Profit Calculation */}
          <div className="card">
            <h2 className="font-bold text-gray-700 text-lg mb-4 pb-2 border-b">
              📈 Net Profit Calculation
            </h2>
            <div className="space-y-3">
              {[
                ["Gross Profit", report.grossProfit, "text-green-600"],
                ["(-) Total Expenses", report.totalExpenses, "text-red-500"],
                [
                  "= Net Profit / Loss",
                  report.netProfit,
                  `font-bold text-xl ${isProfit ? "text-green-600" : "text-red-600"}`,
                ],
              ].map(([label, value, cls]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2
                  border-b border-gray-100 last:border-0 last:pt-2"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-sm ${cls}`}>₹{value?.toFixed(2)}</span>
                </div>
              ))}
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between">
                <span className="text-sm text-gray-600">Net Profit Margin</span>
                <span
                  className={`font-semibold ${
                    isProfit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {report.netProfitMargin?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Collections Summary */}
          <div className="card">
            <h2 className="font-bold text-gray-700 text-lg mb-4 pb-2 border-b">
              💳 Collections Summary
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Total Invoiced", report.totalInvoiced, "text-blue-600"],
                ["Total Collected", report.totalCollected, "text-green-600"],
                ["Outstanding", report.totalOutstanding, "text-red-600"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-4 text-center"
                >
                  <p className={`text-xl font-bold ${color}`}>
                    ₹{value?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
