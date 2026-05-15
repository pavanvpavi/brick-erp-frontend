import { useEffect, useState } from "react";
import { ledgerApi, customerApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import { Search } from "lucide-react";

export default function CustomerLedgerPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);

  useEffect(() => {
    customerApi
      .getAll()
      .then((r) => setCustomers(r.data.data))
      .finally(() => setCustomersLoading(false));
  }, []);

  const handleLoad = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    setLoading(true);
    try {
      const res = await ledgerApi.getCustomerLedger(selectedCustomer);
      setLedger(res.data.data);
    } catch {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Customer Ledger</h1>

      {/* Customer Selector */}
      <div className="card mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Customer
            </label>
            <select
              className="input-field"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Choose a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerCode} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLoad}
            className="btn-primary flex items-center gap-2"
          >
            <Search size={16} /> Load Ledger
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {ledger && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-2xl font-bold text-blue-600">
                ₹{ledger.totalInvoiced?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Total Invoiced</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">
                ₹{ledger.totalPaid?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Total Paid</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-red-600">
                ₹{ledger.totalOutstanding?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Outstanding</p>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-700">
                Ledger — {ledger.customerName} ({ledger.customerCode})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header">Date</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Reference</th>
                    <th className="table-header">Description</th>
                    <th className="table-header text-right">Debit (₹)</th>
                    <th className="table-header text-right">Credit (₹)</th>
                    <th className="table-header text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    ledger.entries?.map((entry, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="table-cell">{entry.date}</td>
                        <td className="table-cell">
                          <span
                            className={
                              entry.type === "INVOICE"
                                ? "badge-blue"
                                : "badge-green"
                            }
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="table-cell font-mono text-xs">
                          {entry.referenceNumber}
                        </td>
                        <td className="table-cell text-xs">
                          {entry.description}
                        </td>
                        <td className="table-cell text-right text-red-600 font-medium">
                          {entry.debit > 0
                            ? `₹${entry.debit?.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="table-cell text-right text-green-600 font-medium">
                          {entry.credit > 0
                            ? `₹${entry.credit?.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="table-cell text-right font-semibold">
                          ₹{entry.balance?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="table-cell">
                      Total
                    </td>
                    <td className="table-cell text-right text-red-600">
                      ₹{ledger.totalInvoiced?.toFixed(2)}
                    </td>
                    <td className="table-cell text-right text-green-600">
                      ₹{ledger.totalPaid?.toFixed(2)}
                    </td>
                    <td className="table-cell text-right text-amber-600">
                      ₹{ledger.totalOutstanding?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
