import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PurchaseOrderForm from "./PurchaseOrderForm";
import SupplierForm from "./SupplierForm";
import toast from "react-hot-toast";
import { Plus, Eye, Send, PackageCheck, XCircle, Users } from "lucide-react";
import { PO_STATUS_COLORS } from "../../utils/constants";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { procurementApi, priceHistoryApi } from "../../api/endpoints";
import { pdfApi } from "../../api/endpoints";
import { downloadPdf, openPdfInNewTab } from "../../utils/pdfDownload";
import { Download, Printer } from "lucide-react";

export default function ProcurementPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [showPoForm, setShowPoForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [viewPo, setViewPo] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [receiveItems, setReceiveItems] = useState([]);
  const [cancelId, setCancelId] = useState(null);
  const poPagination = usePagination(purchaseOrders, 10);
  const supplierPagination = usePagination(suppliers, 10);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const priceHistoryPagination = usePagination(priceHistory, 10);

  const fetchData = async () => {
    try {
      const [poRes, supRes] = await Promise.all([
        procurementApi.getPurchaseOrders(),
        procurementApi.getSuppliers(),
      ]);
      setPurchaseOrders(poRes.data.data);
      setSuppliers(supRes.data.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (id) => {
    try {
      await procurementApi.sendToSupplier(id);
      toast.success("PO sent to supplier");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const openReceive = (po) => {
    setSelectedPo(po);
    setReceiveItems(
      po.items?.map((item) => ({
        itemId: item.id,
        productName: item.productName,
        pendingQuantity: item.pendingQuantity,
        receivedQuantity: item.pendingQuantity,
      })) || [],
    );
    setShowReceiveModal(true);
  };

  const handleReceive = async () => {
    try {
      await procurementApi.receiveItems(selectedPo.id, {
        items: receiveItems.map((i) => ({
          itemId: i.itemId,
          receivedQuantity: parseInt(i.receivedQuantity),
        })),
        notes: "Items received",
      });
      toast.success("Items received — stock updated");
      setShowReceiveModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleCancel = async () => {
    try {
      await procurementApi.cancelPurchaseOrder(cancelId);
      toast.success("PO cancelled");
      setCancelId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Procurement</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditSupplier(null);
              setShowSupplierForm(true);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Users size={16} /> Add Supplier
          </button>
          <button
            onClick={() => setShowPoForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {activeTab === "priceHistory" && (
          <div>
            <div className="card mb-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Supplier
                  </label>
                  <select
                    className="input-field"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                  >
                    <option value="">Choose supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    if (!selectedSupplierId) return;
                    const r =
                      await priceHistoryApi.getBySupplier(selectedSupplierId);
                    setPriceHistory(r.data.data);
                  }}
                  className="btn-primary"
                >
                  Load History
                </button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="table-header">Date</th>
                      <th className="table-header">Product</th>
                      <th className="table-header">Unit Price</th>
                      <th className="table-header">PO Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistoryPagination.paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-400"
                        >
                          Select a supplier to view price history
                        </td>
                      </tr>
                    ) : (
                      priceHistoryPagination.paginatedData.map((h, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="table-cell">{h.effectiveDate}</td>
                          <td className="table-cell font-medium">
                            {h.product?.name}
                          </td>
                          <td className="table-cell font-semibold text-amber-600">
                            ₹{h.unitPrice?.toFixed(2)}
                          </td>
                          <td className="table-cell font-mono text-xs">
                            {h.poNumber || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={priceHistoryPagination.currentPage}
                totalPages={priceHistoryPagination.totalPages}
                totalItems={priceHistoryPagination.totalItems}
                pageSize={priceHistoryPagination.pageSize}
                onPageChange={priceHistoryPagination.goToPage}
                hasNext={priceHistoryPagination.hasNext}
                hasPrev={priceHistoryPagination.hasPrev}
              />
            </div>
          </div>
        )}
      </div>

      {/* Purchase Orders Tab */}
      {activeTab === "orders" && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="table-header">PO #</th>
                  <th className="table-header">Supplier</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Expected</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No purchase orders
                    </td>
                  </tr>
                ) : (
                  poPagination.paginatedData.map((po) => (
                    <tr key={po.id} className="border-b hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs font-semibold">
                        {po.poNumber}
                      </td>
                      <td className="table-cell font-medium">
                        {po.supplierName}
                      </td>
                      <td className="table-cell">{po.orderDate}</td>
                      <td className="table-cell">
                        {po.expectedDeliveryDate || "—"}
                      </td>
                      <td className="table-cell font-semibold">
                        ₹{po.totalAmount?.toFixed(2)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={
                            PO_STATUS_COLORS[po.status] || "badge-gray"
                          }
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const r =
                                await procurementApi.getPurchaseOrderById(
                                  po.id,
                                );
                              setViewPo(r.data.data);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const res = await pdfApi.downloadPurchaseOrder(
                                  po.id,
                                );
                                downloadPdf(res.data, `PO_${po.poNumber}.pdf`);
                                toast.success("PO downloaded");
                              } catch {
                                toast.error("Failed to download PDF");
                              }
                            }}
                            className="text-gray-400 hover:text-red-600"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const res = await pdfApi.downloadPurchaseOrder(
                                  po.id,
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

                          {po.status === "DRAFT" && (
                            <button
                              onClick={() => handleSend(po.id)}
                              className="text-gray-400 hover:text-amber-600"
                              title="Send to Supplier"
                            >
                              <Send size={16} />
                            </button>
                          )}

                          {(po.status === "SENT" ||
                            po.status === "PARTIALLY_RECEIVED") && (
                            <button
                              onClick={async () => {
                                const r =
                                  await procurementApi.getPurchaseOrderById(
                                    po.id,
                                  );
                                openReceive(r.data.data);
                              }}
                              className="text-gray-400 hover:text-green-600"
                              title="Receive Items"
                            >
                              <PackageCheck size={16} />
                            </button>
                          )}

                          {(po.status === "DRAFT" || po.status === "SENT") && (
                            <button
                              onClick={() => setCancelId(po.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Cancel"
                            >
                              <XCircle size={16} />
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
              currentPage={poPagination.currentPage}
              totalPages={poPagination.totalPages}
              totalItems={poPagination.totalItems}
              pageSize={poPagination.pageSize}
              onPageChange={poPagination.goToPage}
              hasNext={poPagination.hasNext}
              hasPrev={poPagination.hasPrev}
            />
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === "suppliers" && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="table-header">Code</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">City</th>
                  <th className="table-header">GSTIN</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No suppliers
                    </td>
                  </tr>
                ) : (
                  supplierPagination.paginatedData.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs">
                        {s.supplierCode}
                      </td>
                      <td className="table-cell font-medium">{s.name}</td>
                      <td className="table-cell">{s.contactPerson || "—"}</td>
                      <td className="table-cell">{s.phone || "—"}</td>
                      <td className="table-cell">{s.city || "—"}</td>
                      <td className="table-cell font-mono text-xs">
                        {s.gstin || "—"}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => {
                            setEditSupplier(s);
                            setShowSupplierForm(true);
                          }}
                          className="text-gray-400 hover:text-amber-600"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={supplierPagination.currentPage}
              totalPages={supplierPagination.totalPages}
              totalItems={supplierPagination.totalItems}
              pageSize={supplierPagination.pageSize}
              onPageChange={supplierPagination.goToPage}
              hasNext={supplierPagination.hasNext}
              hasPrev={supplierPagination.hasPrev}
            />
          </div>
        </div>
      )}

      {/* New PO Modal */}
      <Modal
        isOpen={showPoForm}
        onClose={() => setShowPoForm(false)}
        title="New Purchase Order"
        size="xl"
      >
        <PurchaseOrderForm
          onSuccess={() => {
            setShowPoForm(false);
            fetchData();
          }}
          onCancel={() => setShowPoForm(false)}
        />
      </Modal>

      {/* Supplier Form Modal */}
      <Modal
        isOpen={showSupplierForm}
        onClose={() => setShowSupplierForm(false)}
        title={editSupplier ? "Edit Supplier" : "Add Supplier"}
        size="md"
      >
        <SupplierForm
          supplier={editSupplier}
          onSuccess={() => {
            setShowSupplierForm(false);
            fetchData();
          }}
          onCancel={() => setShowSupplierForm(false)}
        />
      </Modal>

      {/* View PO Modal */}
      <Modal
        isOpen={!!viewPo}
        onClose={() => setViewPo(null)}
        title={`PO ${viewPo?.poNumber}`}
        size="lg"
      >
        {viewPo && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Supplier", viewPo.supplierName],
                ["Status", viewPo.status],
                ["Order Date", viewPo.orderDate],
                ["Expected", viewPo.expectedDeliveryDate || "—"],
                ["Subtotal", `₹${viewPo.subtotal}`],
                ["Tax", `₹${viewPo.taxAmount}`],
                ["Total", `₹${viewPo.totalAmount}`],
                ["Warehouse", viewPo.warehouseName],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="font-medium">{value || "—"}</p>
                </div>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="table-header">Product</th>
                  <th className="table-header">Ordered</th>
                  <th className="table-header">Received</th>
                  <th className="table-header">Pending</th>
                  <th className="table-header">Unit Price</th>
                  <th className="table-header">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewPo.items?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="table-cell">{item.productName}</td>
                    <td className="table-cell">{item.quantityOrdered}</td>
                    <td className="table-cell text-green-600">
                      {item.quantityReceived}
                    </td>
                    <td className="table-cell text-amber-600">
                      {item.pendingQuantity}
                    </td>
                    <td className="table-cell">₹{item.unitPrice}</td>
                    <td className="table-cell font-semibold">
                      ₹{item.lineTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Receive Items Modal */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title="Receive Items"
        size="md"
      >
        <div className="space-y-3">
          {receiveItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  Pending: {item.pendingQuantity}
                </p>
              </div>
              <div className="w-32">
                <label className="block text-xs text-gray-500 mb-1">
                  Receive Qty
                </label>
                <input
                  type="number"
                  className="input-field text-sm"
                  min="0"
                  max={item.pendingQuantity}
                  value={item.receivedQuantity}
                  onChange={(e) => {
                    const items = [...receiveItems];
                    items[i] = {
                      ...items[i],
                      receivedQuantity: e.target.value,
                    };
                    setReceiveItems(items);
                  }}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowReceiveModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleReceive} className="btn-primary">
              Confirm Receipt
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Purchase Order"
        message="Are you sure you want to cancel this purchase order?"
      />
    </div>
  );
}
