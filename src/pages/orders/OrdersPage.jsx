import { useEffect, useState } from "react";
import { orderApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import OrderForm from "./OrderForm";
import toast from "react-hot-toast";
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react";
import { ORDER_STATUS_COLORS } from "../../utils/constants";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const pagination = usePagination(orders, 10);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      setOrders(res.data.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await orderApi.confirm(id);
      toast.success("Order confirmed — stock deducted");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleCancel = async (id) => {
    try {
      await orderApi.cancel(id, "Cancelled by user");
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Sales Orders</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ["Total", orders.length, "text-blue-600"],
          [
            "Draft",
            orders.filter((o) => o.status === "DRAFT").length,
            "text-gray-600",
          ],
          [
            "Confirmed",
            orders.filter((o) => o.status === "CONFIRMED").length,
            "text-green-600",
          ],
          [
            "Cancelled",
            orders.filter((o) => o.status === "CANCELLED").length,
            "text-red-600",
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
                <th className="table-header">Order #</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Date</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs font-semibold">
                      {o.orderNumber}
                    </td>
                    <td className="table-cell font-medium">{o.customerName}</td>
                    <td className="table-cell">{o.orderDate}</td>
                    <td className="table-cell">{o.itemCount}</td>
                    <td className="table-cell font-semibold">
                      ₹{o.totalAmount?.toFixed(2)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={
                          ORDER_STATUS_COLORS[o.status] || "badge-gray"
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const r = await orderApi.getById(o.id);
                            setViewOrder(r.data.data);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {o.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => handleConfirm(o.id)}
                              className="text-gray-400 hover:text-green-600"
                              title="Confirm"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleCancel(o.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Cancel"
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

      {/* New Order Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Sales Order"
        size="xl"
      >
        <OrderForm
          onSuccess={() => {
            setShowForm(false);
            fetchOrders();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`Order ${viewOrder?.orderNumber}`}
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Customer", viewOrder.customerName],
                ["Status", viewOrder.status],
                ["Order Date", viewOrder.orderDate],
                ["Expected Delivery", viewOrder.expectedDeliveryDate || "—"],
                ["Subtotal", `₹${viewOrder.subtotal}`],
                ["Tax", `₹${viewOrder.taxAmount}`],
                ["Discount", `₹${viewOrder.discountAmount}`],
                ["Total", `₹${viewOrder.totalAmount}`],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="font-medium">{value || "—"}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="table-header">Product</th>
                    <th className="table-header">Qty</th>
                    <th className="table-header">Price</th>
                    <th className="table-header">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.items?.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="table-cell">{item.productName}</td>
                      <td className="table-cell">{item.quantity}</td>
                      <td className="table-cell">₹{item.unitPrice}</td>
                      <td className="table-cell font-semibold">
                        ₹{item.lineTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
