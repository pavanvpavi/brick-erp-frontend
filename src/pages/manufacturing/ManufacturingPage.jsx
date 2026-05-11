import { useEffect, useState } from "react";
import { manufacturingApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import BomForm from "./BomForm";
import ProductionOrderForm from "./ProductionOrderForm";
import toast from "react-hot-toast";
import { Plus, Eye, Play, CheckSquare, XCircle } from "lucide-react";
import { PRODUCTION_STATUS_COLORS } from "../../utils/constants";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";

export default function ManufacturingPage() {
  const [productionOrders, setProductionOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [showPoForm, setShowPoForm] = useState(false);
  const [showBomForm, setShowBomForm] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [completeId, setCompleteId] = useState(null);
  const [producedQty, setProducedQty] = useState("");
  const productionPagination = usePagination(productionOrders, 10);
  const bomPagination = usePagination(boms, 10);

  const fetchData = async () => {
    try {
      const [poRes, bomRes] = await Promise.all([
        manufacturingApi.getProductionOrders(),
        manufacturingApi.getBoms(),
      ]);
      setProductionOrders(poRes.data.data);
      setBoms(bomRes.data.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStart = async (id) => {
    try {
      await manufacturingApi.startProduction(id);
      toast.success("Production started — materials deducted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleComplete = async () => {
    try {
      await manufacturingApi.completeProduction(completeId, {
        producedQuantity: parseInt(producedQty),
        notes: "Production completed",
      });
      toast.success("Production completed — finished goods added to stock");
      setCompleteId(null);
      setProducedQty("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleCancel = async (id) => {
    try {
      await manufacturingApi.cancelProduction(id);
      toast.success("Production order cancelled");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Manufacturing</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBomForm(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={16} /> Add BOM
          </button>
          <button
            onClick={() => setShowPoForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> New Production Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["orders", "boms"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-amber-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab === "orders" ? "Production Orders" : "Bill of Materials"}
          </button>
        ))}
      </div>

      {/* Production Orders Tab */}
      {activeTab === "orders" && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="table-header">PRD #</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">BOM</th>
                  <th className="table-header">Planned Qty</th>
                  <th className="table-header">Produced</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productionOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No production orders
                    </td>
                  </tr>
                ) : (
                  productionPagination.paginatedData.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs font-semibold">
                        {o.productionNumber}
                      </td>
                      <td className="table-cell font-medium">
                        {o.finishedProductName}
                      </td>
                      <td className="table-cell text-xs">{o.bomName}</td>
                      <td className="table-cell">{o.plannedQuantity}</td>
                      <td className="table-cell text-green-600">
                        {o.producedQuantity}
                      </td>
                      <td className="table-cell">
                        <span
                          className={
                            PRODUCTION_STATUS_COLORS[o.status] || "badge-gray"
                          }
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const r =
                                await manufacturingApi.getProductionOrderById(
                                  o.id,
                                );
                              setViewOrder(r.data.data);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          {o.status === "PLANNED" && (
                            <button
                              onClick={() => handleStart(o.id)}
                              className="text-gray-400 hover:text-green-600"
                              title="Start Production"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          {o.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => {
                                setCompleteId(o.id);
                                setProducedQty(o.plannedQuantity.toString());
                              }}
                              className="text-gray-400 hover:text-green-600"
                              title="Complete"
                            >
                              <CheckSquare size={16} />
                            </button>
                          )}
                          {(o.status === "PLANNED" ||
                            o.status === "IN_PROGRESS") && (
                            <button
                              onClick={() => handleCancel(o.id)}
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
              currentPage={productionPagination.currentPage}
              totalPages={productionPagination.totalPages}
              totalItems={productionPagination.totalItems}
              pageSize={productionPagination.pageSize}
              onPageChange={productionPagination.goToPage}
              hasNext={productionPagination.hasNext}
              hasPrev={productionPagination.hasPrev}
            />
          </div>
        </div>
      )}

      {/* BOMs Tab */}
      {activeTab === "boms" && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="table-header">Name</th>
                  <th className="table-header">Finished Product</th>
                  <th className="table-header">Version</th>
                  <th className="table-header">Output Qty</th>
                  <th className="table-header">Materials</th>
                  <th className="table-header">Default</th>
                </tr>
              </thead>
              <tbody>
                {boms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No BOMs found
                    </td>
                  </tr>
                ) : (
                  bomPagination.paginatedData.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="table-cell font-medium">{b.name}</td>
                      <td className="table-cell">{b.finishedProductName}</td>
                      <td className="table-cell">{b.version || "—"}</td>
                      <td className="table-cell">{b.outputQuantity}</td>
                      <td className="table-cell">
                        {b.bomItems?.length || 0} items
                      </td>
                      <td className="table-cell">
                        {b.isDefault ? (
                          <span className="badge-green">Default</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={bomPagination.currentPage}
              totalPages={bomPagination.totalPages}
              totalItems={bomPagination.totalItems}
              pageSize={bomPagination.pageSize}
              onPageChange={bomPagination.goToPage}
              hasNext={bomPagination.hasNext}
              hasPrev={bomPagination.hasPrev}
            />
          </div>
        </div>
      )}

      {/* New Production Order Modal */}
      <Modal
        isOpen={showPoForm}
        onClose={() => setShowPoForm(false)}
        title="New Production Order"
        size="md"
      >
        <ProductionOrderForm
          onSuccess={() => {
            setShowPoForm(false);
            fetchData();
          }}
          onCancel={() => setShowPoForm(false)}
        />
      </Modal>

      {/* BOM Form Modal */}
      <Modal
        isOpen={showBomForm}
        onClose={() => setShowBomForm(false)}
        title="Add Bill of Materials"
        size="lg"
      >
        <BomForm
          onSuccess={() => {
            setShowBomForm(false);
            fetchData();
          }}
          onCancel={() => setShowBomForm(false)}
        />
      </Modal>

      {/* View Production Order Modal */}
      <Modal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={`Production Order ${viewOrder?.productionNumber}`}
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Product", viewOrder.finishedProductName],
                ["Status", viewOrder.status],
                ["BOM", viewOrder.bomName],
                ["Warehouse", viewOrder.warehouseName],
                ["Planned Qty", viewOrder.plannedQuantity],
                ["Produced Qty", viewOrder.producedQuantity],
                [
                  "Start Date",
                  viewOrder.actualStartDate ||
                    viewOrder.plannedStartDate ||
                    "—",
                ],
                [
                  "End Date",
                  viewOrder.actualEndDate || viewOrder.plannedEndDate || "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="font-medium">{value || "—"}</p>
                </div>
              ))}
            </div>
            {viewOrder.consumptions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Material Consumption
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="table-header">Material</th>
                      <th className="table-header">Planned</th>
                      <th className="table-header">Consumed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.consumptions.map((c) => (
                      <tr key={c.id} className="border-b">
                        <td className="table-cell">{c.materialProductName}</td>
                        <td className="table-cell">{c.plannedQuantity}</td>
                        <td className="table-cell text-green-600">
                          {c.consumedQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Complete Production Modal */}
      <Modal
        isOpen={!!completeId}
        onClose={() => setCompleteId(null)}
        title="Complete Production"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produced Quantity *
            </label>
            <input
              type="number"
              className="input-field"
              min="1"
              value={producedQty}
              onChange={(e) => setProducedQty(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCompleteId(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleComplete} className="btn-primary">
              Complete Production
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
