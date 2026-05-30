import { useEffect, useState } from "react";
import { dispatchApi, orderApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import { pdfApi } from "../../api/endpoints";
import { downloadPdf, openPdfInNewTab } from "../../utils/pdfDownload";
import { Download, Printer } from "lucide-react";

const STATUS_COLORS = {
  PENDING: "badge-yellow",
  DISPATCHED: "badge-blue",
  DELIVERED: "badge-green",
  FAILED: "badge-red",
};

export default function DispatchPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewDelivery, setViewDelivery] = useState(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    salesOrderId: "",
    deliveryDate: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    deliveryAddress: "",
    notes: "",
  });
  const [deliverForm, setDeliverForm] = useState({
    receivedBy: "",
    receivedAt: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const pagination = usePagination(deliveries, 10);

  const fetchDeliveries = async () => {
    try {
      const res = await dispatchApi.getAll();
      setDeliveries(res.data.data);
    } catch {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleOrders = async () => {
    try {
      const [ordersRes, deliveriesRes] = await Promise.all([
        orderApi.getAll(),
        dispatchApi.getAll(),
      ]);
      const deliveredOrderIds = new Set(
        deliveriesRes.data.data
          .filter((d) => d.status !== "FAILED")
          .map((d) => d.salesOrderId),
      );
      const eligible = ordersRes.data.data.filter(
        (o) =>
          (o.status === "CONFIRMED" ||
            o.status === "PROCESSING" ||
            o.status === "SHIPPED") &&
          !deliveredOrderIds.has(o.id),
      );
      setOrders(eligible);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchEligibleOrders();
  }, []);

  const handleChange = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));
  const handleDeliverChange = (field) => (e) =>
    setDeliverForm((p) => ({ ...p, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatchApi.create({
        ...form,
        salesOrderId: parseInt(form.salesOrderId),
      });
      toast.success("Delivery order created");
      setShowForm(false);
      setForm({
        salesOrderId: "",
        deliveryDate: "",
        vehicleNumber: "",
        driverName: "",
        driverPhone: "",
        deliveryAddress: "",
        notes: "",
      });
      fetchDeliveries();
      fetchEligibleOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async (id) => {
    try {
      await dispatchApi.dispatch(id);
      toast.success("Dispatched successfully");
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    try {
      await dispatchApi.markDelivered(selectedId, deliverForm);
      toast.success("Marked as delivered");
      setShowDeliverModal(false);
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleFail = async (id) => {
    try {
      await dispatchApi.markFailed(id, "Delivery failed");
      toast.success("Marked as failed");
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Dispatch & Delivery</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Delivery
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ["Total", deliveries.length, "text-blue-600"],
          [
            "Pending",
            deliveries.filter((d) => d.status === "PENDING").length,
            "text-yellow-600",
          ],
          [
            "Dispatched",
            deliveries.filter((d) => d.status === "DISPATCHED").length,
            "text-blue-600",
          ],
          [
            "Delivered",
            deliveries.filter((d) => d.status === "DELIVERED").length,
            "text-green-600",
          ],
        ].map(([label, count, color]) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">DEL #</th>
                <th className="table-header">Order #</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Driver</th>
                <th className="table-header">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No deliveries found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs font-semibold">
                      {d.deliveryNumber}
                    </td>
                    <td className="table-cell font-mono text-xs">
                      {d.salesOrderNumber}
                    </td>
                    <td className="table-cell font-medium">{d.customerName}</td>
                    <td className="table-cell">{d.vehicleNumber || "—"}</td>
                    <td className="table-cell">{d.driverName || "—"}</td>
                    <td className="table-cell">{d.deliveryDate || "—"}</td>
                    <td className="table-cell">
                      <span className={STATUS_COLORS[d.status] || "badge-gray"}>
                        {d.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const r = await dispatchApi.getById(d.id);
                            setViewDelivery(r.data.data);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await pdfApi.downloadDeliveryChallan(
                                d.id,
                              );
                              downloadPdf(
                                res.data,
                                `Challan_${d.deliveryNumber}.pdf`,
                              );
                              toast.success("Challan downloaded");
                            } catch {
                              toast.error("Failed to download PDF");
                            }
                          }}
                          className="text-gray-400 hover:text-red-600"
                          title="Download Challan"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await pdfApi.downloadDeliveryChallan(
                                d.id,
                              );
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
                        {d.status === "PENDING" && (
                          <button
                            onClick={() => handleDispatch(d.id)}
                            className="text-gray-400 hover:text-amber-600"
                            title="Dispatch"
                          >
                            <Truck size={16} />
                          </button>
                        )}
                        {d.status === "DISPATCHED" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedId(d.id);
                                setShowDeliverModal(true);
                              }}
                              className="text-gray-400 hover:text-green-600"
                              title="Mark Delivered"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleFail(d.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Mark Failed"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
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

      {/* Create Delivery Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Delivery Order"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Order *
            </label>
            <select
              className="input-field"
              value={form.salesOrderId}
              onChange={handleChange("salesOrderId")}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                className="input-field"
                value={form.deliveryDate}
                onChange={handleChange("deliveryDate")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                className="input-field"
                value={form.vehicleNumber}
                onChange={handleChange("vehicleNumber")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                className="input-field"
                value={form.driverName}
                onChange={handleChange("driverName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <input
                type="text"
                className="input-field"
                value={form.driverPhone}
                onChange={handleChange("driverPhone")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={form.deliveryAddress}
              onChange={handleChange("deliveryAddress")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              className="input-field"
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
              {saving ? "Creating..." : "Create Delivery"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Delivered Modal */}
      <Modal
        isOpen={showDeliverModal}
        onClose={() => setShowDeliverModal(false)}
        title="Confirm Delivery"
        size="sm"
      >
        <form onSubmit={handleDeliver} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received By
            </label>
            <input
              type="text"
              className="input-field"
              value={deliverForm.receivedBy}
              onChange={handleDeliverChange("receivedBy")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received Date
            </label>
            <input
              type="date"
              className="input-field"
              value={deliverForm.receivedAt}
              onChange={handleDeliverChange("receivedAt")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={deliverForm.notes}
              onChange={handleDeliverChange("notes")}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowDeliverModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Delivery
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewDelivery}
        onClose={() => setViewDelivery(null)}
        title={`Delivery ${viewDelivery?.deliveryNumber}`}
        size="md"
      >
        {viewDelivery && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Delivery #", viewDelivery.deliveryNumber],
              ["Sales Order", viewDelivery.salesOrderNumber],
              ["Customer", viewDelivery.customerName],
              ["Status", viewDelivery.status],
              ["Vehicle", viewDelivery.vehicleNumber || "—"],
              ["Driver", viewDelivery.driverName || "—"],
              ["Driver Phone", viewDelivery.driverPhone || "—"],
              ["Delivery Date", viewDelivery.deliveryDate || "—"],
              ["Received By", viewDelivery.receivedBy || "—"],
              ["Received At", viewDelivery.receivedAt || "—"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
            {viewDelivery.deliveryAddress && (
              <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Delivery Address</p>
                <p className="font-medium">{viewDelivery.deliveryAddress}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
