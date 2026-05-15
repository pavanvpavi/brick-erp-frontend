import { useEffect, useState } from "react";
import {
  stockTransferApi,
  productApi,
  inventoryApi,
} from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Eye } from "lucide-react";

const STATUS_COLORS = {
  COMPLETED: "badge-green",
  PENDING: "badge-yellow",
  CANCELLED: "badge-red",
};

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    fromWarehouseId: "",
    toWarehouseId: "",
    quantity: "",
    notes: "",
  });
  const [fromStock, setFromStock] = useState(null);

  const pagination = usePagination(transfers, 10);

  const fetchTransfers = async () => {
    try {
      const res = await stockTransferApi.getAll();
      setTransfers(res.data.data);
    } catch {
      toast.error("Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    productApi.getAll().then((r) => setProducts(r.data.data));
    inventoryApi.getWarehouses().then((r) => setWarehouses(r.data.data));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Load available stock when product and from warehouse selected
  useEffect(() => {
    if (form.productId && form.fromWarehouseId) {
      inventoryApi.getStockByWarehouse(form.fromWarehouseId).then((r) => {
        const stock = r.data.data.find(
          (s) => s.productId === parseInt(form.productId),
        );
        setFromStock(stock || null);
      });
    } else {
      setFromStock(null);
    }
  }, [form.productId, form.fromWarehouseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.fromWarehouseId === form.toWarehouseId) {
      toast.error("Source and destination warehouses cannot be the same");
      return;
    }
    setSaving(true);
    try {
      await stockTransferApi.create({
        productId: parseInt(form.productId),
        fromWarehouseId: parseInt(form.fromWarehouseId),
        toWarehouseId: parseInt(form.toWarehouseId),
        quantity: parseInt(form.quantity),
        notes: form.notes,
      });
      toast.success("Stock transferred successfully");
      setShowForm(false);
      setForm({
        productId: "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: "",
        notes: "",
      });
      setFromStock(null);
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Stock Transfer</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ["Total Transfers", transfers.length, "text-blue-600"],
          [
            "Completed",
            transfers.filter((t) => t.status === "COMPLETED").length,
            "text-green-600",
          ],
          [
            "Cancelled",
            transfers.filter((t) => t.status === "CANCELLED").length,
            "text-red-600",
          ],
        ].map(([label, value, color]) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">Transfer #</th>
                <th className="table-header">Product</th>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No transfers found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs font-semibold">
                      {t.transferNumber}
                    </td>
                    <td className="table-cell font-medium">{t.productName}</td>
                    <td className="table-cell">
                      <span className="text-red-600">
                        {t.fromWarehouseName}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-green-600">
                        {t.toWarehouseName}
                      </span>
                    </td>
                    <td className="table-cell font-semibold">{t.quantity}</td>
                    <td className="table-cell">
                      <span className={STATUS_COLORS[t.status] || "badge-gray"}>
                        {t.status}
                      </span>
                    </td>
                    <td className="table-cell text-xs">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setViewTransfer(t)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Eye size={16} />
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

      {/* New Transfer Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Stock Transfer"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              className="input-field"
              value={form.productId}
              onChange={handleChange("productId")}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Warehouse *
            </label>
            <select
              className="input-field"
              value={form.fromWarehouseId}
              onChange={handleChange("fromWarehouseId")}
              required
            >
              <option value="">Select source warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show available stock */}
          {fromStock && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <span className="text-blue-700 font-medium">
                Available stock: {fromStock.availableQuantity} units
              </span>
            </div>
          )}
          {form.productId && form.fromWarehouseId && !fromStock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <span className="text-red-700">
                No stock available in selected warehouse
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Warehouse *
            </label>
            <select
              className="input-field"
              value={form.toWarehouseId}
              onChange={handleChange("toWarehouseId")}
              required
            >
              <option value="">Select destination warehouse</option>
              {warehouses
                .filter((w) => w.id !== parseInt(form.fromWarehouseId))
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              className="input-field"
              min="1"
              max={fromStock?.availableQuantity || undefined}
              value={form.quantity}
              onChange={handleChange("quantity")}
              required
            />
          </div>
          <div>
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
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Transferring..." : "Transfer Stock"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewTransfer}
        onClose={() => setViewTransfer(null)}
        title={`Transfer ${viewTransfer?.transferNumber}`}
        size="md"
      >
        {viewTransfer && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Transfer #", viewTransfer.transferNumber],
              ["Status", viewTransfer.status],
              ["Product", viewTransfer.productName],
              ["SKU", viewTransfer.productSku],
              ["From Warehouse", viewTransfer.fromWarehouseName],
              ["To Warehouse", viewTransfer.toWarehouseName],
              ["Quantity", viewTransfer.quantity],
              [
                "Date",
                viewTransfer.createdAt
                  ? new Date(viewTransfer.createdAt).toLocaleDateString()
                  : "—",
              ],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
            {viewTransfer.notes && (
              <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Notes</p>
                <p className="font-medium">{viewTransfer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
