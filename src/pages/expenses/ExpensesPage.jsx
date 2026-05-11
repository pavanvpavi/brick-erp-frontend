import { useEffect, useState } from "react";
import { expenseApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = [
  "FUEL",
  "ELECTRICITY",
  "LABOR",
  "MAINTENANCE",
  "TRANSPORT",
  "RAW_MATERIAL",
  "OFFICE",
  "OTHER",
];

const CATEGORY_COLORS = {
  FUEL: "badge-red",
  ELECTRICITY: "badge-yellow",
  LABOR: "badge-blue",
  MAINTENANCE: "badge-gray",
  TRANSPORT: "badge-blue",
  RAW_MATERIAL: "badge-green",
  OFFICE: "badge-gray",
  OTHER: "badge-gray",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [form, setForm] = useState({
    category: "FUEL",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paidTo: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    notes: "",
  });

  const filtered =
    filterCategory === "ALL"
      ? expenses
      : expenses.filter((e) => e.category === filterCategory);

  const pagination = usePagination(filtered, 10);

  const fetchExpenses = async () => {
    try {
      const res = await expenseApi.getAll();
      setExpenses(res.data.data);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await expenseApi.create({
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success("Expense recorded");
      setShowForm(false);
      setForm({
        category: "FUEL",
        description: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paidTo: "",
        paymentMethod: "CASH",
        referenceNumber: "",
        notes: "",
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await expenseApi.delete(deleteId);
      toast.success("Expense deleted");
      setDeleteId(null);
      fetchExpenses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalAmount = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Category totals for summary
  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (e.amount || 0), 0),
  })).filter((c) => c.total > 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Expenses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {categoryTotals.slice(0, 4).map(({ category, total }) => (
          <div
            key={category}
            className="card text-center cursor-pointer hover:border-amber-300 transition-colors"
            onClick={() =>
              setFilterCategory(category === filterCategory ? "ALL" : category)
            }
          >
            <p className="text-lg font-bold text-gray-800">
              ₹{total.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {category.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === "ALL"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setFilterCategory(cat === filterCategory ? "ALL" : cat)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="text-sm font-semibold text-gray-700">
            Total:{" "}
            <span className="text-amber-600">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">Exp #</th>
                <th className="table-header">Category</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Date</th>
                <th className="table-header">Paid To</th>
                <th className="table-header">Method</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No expenses found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">
                      {e.expenseNumber}
                    </td>
                    <td className="table-cell">
                      <span
                        className={CATEGORY_COLORS[e.category] || "badge-gray"}
                      >
                        {e.category?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="table-cell">{e.description}</td>
                    <td className="table-cell font-semibold text-amber-600">
                      ₹{e.amount?.toFixed(2)}
                    </td>
                    <td className="table-cell">{e.expenseDate}</td>
                    <td className="table-cell">{e.paidTo || "—"}</td>
                    <td className="table-cell">{e.paymentMethod || "—"}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => setDeleteId(e.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Expense"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                className="input-field"
                value={form.category}
                onChange={handleChange("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                className="input-field"
                required
                value={form.expenseDate}
                onChange={handleChange("expenseDate")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={form.description}
                onChange={handleChange("description")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                className="input-field"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={handleChange("amount")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                className="input-field"
                value={form.paymentMethod}
                onChange={handleChange("paymentMethod")}
              >
                {["CASH", "BANK_TRANSFER", "CHEQUE", "UPI"].map((m) => (
                  <option key={m} value={m}>
                    {m.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid To
              </label>
              <input
                type="text"
                className="input-field"
                value={form.paidTo}
                onChange={handleChange("paidTo")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                className="input-field"
                value={form.referenceNumber}
                onChange={handleChange("referenceNumber")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={form.notes}
                onChange={handleChange("notes")}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
      />
    </div>
  );
}
