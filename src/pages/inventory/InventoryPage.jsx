import { useEffect, useState, useMemo } from "react";
import { inventoryApi, productApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Warehouse, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    adjustmentType: "ADJUSTMENT_IN",
    notes: "",
  });
  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactPerson: "",
    contactPhone: "",
    isDefault: false,
  });

  const filteredStocks = useMemo(
    () =>
      stocks.filter(
        (s) =>
          s.productName?.toLowerCase().includes(search.toLowerCase()) ||
          s.productSku?.toLowerCase().includes(search.toLowerCase()),
      ),
    [stocks, search],
  );

  const pagination = usePagination(filteredStocks, 10);

  useEffect(() => {
    Promise.all([
      inventoryApi.getWarehouses(),
      inventoryApi.getLowStock(),
      productApi.getAll(),
    ])
      .then(([wRes, lRes, pRes]) => {
        setWarehouses(wRes.data.data);
        setLowStock(lRes.data.data);
        setProducts(pRes.data.data);
        if (wRes.data.data.length > 0) {
          setSelectedWarehouse(wRes.data.data[0]);
        }
      })
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      inventoryApi
        .getStockByWarehouse(selectedWarehouse.id)
        .then((r) => setStocks(r.data.data))
        .catch(() => toast.error("Failed to load stock"));
    }
  }, [selectedWarehouse]);

  const handleAdjustChange = (field) => (e) => {
    setAdjustForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleWarehouseChange = (field) => (e) => {
    setWarehouseForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.adjustStock({
        ...adjustForm,
        productId: parseInt(adjustForm.productId),
        warehouseId: parseInt(adjustForm.warehouseId),
        quantity: parseInt(adjustForm.quantity),
      });
      toast.success("Stock adjusted successfully");
      setShowAdjust(false);
      setAdjustForm({
        productId: "",
        warehouseId: "",
        quantity: "",
        adjustmentType: "ADJUSTMENT_IN",
        notes: "",
      });
      if (selectedWarehouse) {
        const r = await inventoryApi.getStockByWarehouse(selectedWarehouse.id);
        setStocks(r.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.createWarehouse(warehouseForm);
      toast.success("Warehouse created");
      setShowWarehouseForm(false);
      setWarehouseForm({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contactPerson: "",
        contactPhone: "",
        isDefault: false,
      });
      const r = await inventoryApi.getWarehouses();
      setWarehouses(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create warehouse");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWarehouseForm(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Warehouse size={16} /> Add Warehouse
          </button>
          <button
            onClick={() => setShowAdjust(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Adjust Stock
          </button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="text-red-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="font-medium text-red-800">Low Stock Alert</p>
            <p className="text-sm text-red-600">
              {lowStock.length} product(s) below minimum stock level:{" "}
              {lowStock.map((s) => s.productName).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {warehouses.map((w) => (
          <button
            key={w.id}
            onClick={() => setSelectedWarehouse(w)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedWarehouse?.id === w.id
                ? "bg-amber-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {w.name}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search products..."
          />
          <span className="text-sm text-gray-500">
            {filteredStocks.length} items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">SKU</th>
                <th className="table-header">Product</th>
                <th className="table-header">On Hand</th>
                <th className="table-header">Reserved</th>
                <th className="table-header">Available</th>
                <th className="table-header">Min Level</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No stock data
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">
                      {s.productSku}
                    </td>
                    <td className="table-cell font-medium">{s.productName}</td>
                    <td className="table-cell">{s.quantityOnHand}</td>
                    <td className="table-cell">{s.quantityReserved}</td>
                    <td className="table-cell font-semibold">
                      {s.availableQuantity}
                    </td>
                    <td className="table-cell">{s.minimumStockLevel}</td>
                    <td className="table-cell">
                      <span
                        className={s.isLowStock ? "badge-red" : "badge-green"}
                      >
                        {s.isLowStock ? "Low Stock" : "OK"}
                      </span>
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

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        title="Adjust Stock"
        size="sm"
      >
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              className="input-field"
              value={adjustForm.productId}
              onChange={handleAdjustChange("productId")}
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
              Warehouse *
            </label>
            <select
              className="input-field"
              value={adjustForm.warehouseId}
              onChange={handleAdjustChange("warehouseId")}
              required
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              className="input-field"
              value={adjustForm.adjustmentType}
              onChange={handleAdjustChange("adjustmentType")}
            >
              <option value="ADJUSTMENT_IN">Stock In (+)</option>
              <option value="ADJUSTMENT_OUT">Stock Out (-)</option>
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
              value={adjustForm.quantity}
              onChange={handleAdjustChange("quantity")}
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
              value={adjustForm.notes}
              onChange={handleAdjustChange("notes")}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAdjust(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Adjust
            </button>
          </div>
        </form>
      </Modal>

      {/* Warehouse Form Modal */}
      <Modal
        isOpen={showWarehouseForm}
        onClose={() => setShowWarehouseForm(false)}
        title="Add Warehouse"
        size="md"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Name *", "name", true],
              ["Code *", "code", true],
              ["City", "city", false],
              ["State", "state", false],
              ["Pincode", "pincode", false],
              ["Contact Person", "contactPerson", false],
              ["Contact Phone", "contactPhone", false],
            ].map(([label, field, req]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={warehouseForm[field]}
                  onChange={handleWarehouseChange(field)}
                  required={req}
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                className="input-field"
                value={warehouseForm.address}
                onChange={handleWarehouseChange("address")}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowWarehouseForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Warehouse
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
