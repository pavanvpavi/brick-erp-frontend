import { useEffect, useState } from "react";
import { financeApi, orderApi, pdfApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";
import { Plus, Eye, Send, CreditCard, Download, Printer } from "lucide-react";
import { INVOICE_STATUS_COLORS } from "../../utils/constants";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { downloadPdf, openPdfInNewTab } from "../../utils/pdfDownload";

export default function FinancePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [createForm, setCreateForm] = useState({
    salesOrderId: "",
    dueDate: "",
    notes: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const pagination = usePagination(invoices, 10);

  const fetchInvoices = async () => {
    try {
      const res = await financeApi.getAll();
      setInvoices(res.data.data);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const loadOrders = async () => {
      const [ordersRes, invoicesRes] = await Promise.all([
        orderApi.getAll(),
        financeApi.getAll(),
      ]);
      const invoicedOrderIds = new Set(
        invoicesRes.data.data
          .filter((inv) => inv.status !== "CANCELLED")
          .map((inv) => inv.salesOrderId),
      );
      const eligibleOrders = ordersRes.data.data.filter(
        (o) =>
          o.status !== "DRAFT" &&
          o.status !== "CANCELLED" &&
          !invoicedOrderIds.has(o.id),
      );
      setOrders(eligibleOrders);
    };
    loadOrders();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await financeApi.createFromOrder({
        salesOrderId: parseInt(createForm.salesOrderId),
        dueDate: createForm.dueDate || null,
        notes: createForm.notes,
      });
      toast.success("Invoice created");
      setShowCreateForm(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id) => {
    try {
      await financeApi.sendInvoice(id);
      toast.success("Invoice sent");
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await financeApi.recordPayment(selectedInvoiceId, {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      });
      toast.success("Payment recorded");
      setShowPaymentForm(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const totalOutstanding = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Finance & Invoices</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
          <p className="text-sm text-gray-500">Total Invoices</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter((i) => i.status === "PAID").length}
          </p>
          <p className="text-sm text-gray-500">Paid</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">
            {
              invoices.filter(
                (i) => i.status === "PARTIALLY_PAID" || i.status === "SENT",
              ).length
            }
          </p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">
            ₹{totalOutstanding.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Outstanding</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">Invoice #</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Date</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Total</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Balance</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    No invoices found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs font-semibold">
                      {inv.invoiceNumber}
                    </td>
                    <td className="table-cell font-medium">
                      {inv.customerName}
                    </td>
                    <td className="table-cell">{inv.invoiceDate}</td>
                    <td className="table-cell">{inv.dueDate}</td>
                    <td className="table-cell">
                      ₹{inv.totalAmount?.toFixed(2)}
                    </td>
                    <td className="table-cell text-green-600">
                      ₹{inv.paidAmount?.toFixed(2)}
                    </td>
                    <td className="table-cell text-red-600 font-semibold">
                      ₹{inv.balanceDue?.toFixed(2)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={
                          INVOICE_STATUS_COLORS[inv.status] || "badge-gray"
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <button
                          onClick={async () => {
                            const r = await financeApi.getById(inv.id);
                            setViewInvoice(r.data.data);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={async () => {
                            try {
                              const res = await pdfApi.downloadInvoice(inv.id);
                              downloadPdf(
                                res.data,
                                `Invoice_${inv.invoiceNumber}.pdf`,
                              );
                              toast.success("Invoice downloaded");
                            } catch {
                              toast.error("Failed to download PDF");
                            }
                          }}
                          className="text-gray-400 hover:text-red-600"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>

                        {/* Print Invoice */}
                        <button
                          onClick={async () => {
                            try {
                              const res = await pdfApi.downloadInvoice(inv.id);
                              openPdfInNewTab(res.data);
                            } catch {
                              toast.error("Failed to open PDF");
                            }
                          }}
                          className="text-gray-400 hover:text-purple-600"
                          title="Print"
                        >
                          <Printer size={16} />
                        </button>

                        {/* Send Invoice */}
                        {inv.status === "DRAFT" && (
                          <button
                            onClick={() => handleSend(inv.id)}
                            className="text-gray-400 hover:text-amber-600"
                            title="Send Invoice"
                          >
                            <Send size={16} />
                          </button>
                        )}

                        {/* Record Payment */}
                        {["SENT", "PARTIALLY_PAID"].includes(inv.status) && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(inv.id);
                              setPaymentForm((f) => ({
                                ...f,
                                amount: inv.balanceDue,
                              }));
                              setShowPaymentForm(true);
                            }}
                            className="text-gray-400 hover:text-green-600"
                            title="Record Payment"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Invoice"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Order *
            </label>
            <select
              className="input-field"
              value={createForm.salesOrderId}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, salesOrderId: e.target.value }))
              }
              required
            >
              <option value="">Select order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customerName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="input-field"
              value={createForm.dueDate}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={createForm.notes}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title="Record Payment"
        size="sm"
      >
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              className="input-field"
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, amount: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              className="input-field"
              value={paymentForm.paymentDate}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              className="input-field"
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, paymentMethod: e.target.value }))
              }
            >
              {["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"].map(
                (m) => (
                  <option key={m} value={m}>
                    {m.replace("_", " ")}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              className="input-field"
              value={paymentForm.referenceNumber}
              onChange={(e) =>
                setPaymentForm((f) => ({
                  ...f,
                  referenceNumber: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title={`Invoice ${viewInvoice?.invoiceNumber}`}
        size="lg"
      >
        {viewInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Customer", viewInvoice.customerName],
                ["Order #", viewInvoice.salesOrderNumber],
                ["Status", viewInvoice.status],
                ["Invoice Date", viewInvoice.invoiceDate],
                ["Due Date", viewInvoice.dueDate],
                ["Total", `₹${viewInvoice.totalAmount}`],
                ["Paid", `₹${viewInvoice.paidAmount}`],
                ["Balance", `₹${viewInvoice.balanceDue}`],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="font-medium">{value || "—"}</p>
                </div>
              ))}
            </div>
            {viewInvoice.payments?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Payments</h3>
                {viewInvoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-green-50 rounded-lg p-3 text-sm flex justify-between"
                  >
                    <span>
                      {p.paymentNumber} — {p.paymentMethod}
                    </span>
                    <span className="font-semibold text-green-700">
                      ₹{p.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
