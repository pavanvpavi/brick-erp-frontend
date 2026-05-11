import { useState, useEffect } from "react";
import { procurementApi, productApi, inventoryApi } from "../../api/endpoints";
import toast from "react-hot-toast";

export default function PurchaseOrderForm({ onSuccess, onCancel }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supplierId: "",
    warehouseId: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [
      {
        productId: "",
        quantityOrdered: "",
        unitPrice: "",
        taxPercentage: "18",
      },
    ],
  });

  useEffect(() => {
    procurementApi.getSuppliers().then((r) => setSuppliers(r.data.data));
    productApi.getAll().then((r) => setProducts(r.data.data));
    inventoryApi.getWarehouses().then((r) => setWarehouses(r.data.data));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleItemChange = (index, field) => (e) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: e.target.value };
      if (field === "productId") {
        const p = products.find((p) => p.id === parseInt(e.target.value));
        if (p) items[index].unitPrice = p.costPrice || "";
      }
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          quantityOrdered: "",
          unitPrice: "",
          taxPercentage: "18",
        },
      ],
    }));

  const removeItem = (i) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await procurementApi.createPurchaseOrder({
        supplierId: parseInt(form.supplierId),
        warehouseId: parseInt(form.warehouseId),
        expectedDeliveryDate: form.expectedDeliveryDate || null,
        notes: form.notes,
        items: form.items.map((i) => ({
          productId: parseInt(i.productId),
          quantityOrdered: parseInt(i.quantityOrdered),
          unitPrice: parseFloat(i.unitPrice),
          taxPercentage: i.taxPercentage ? parseFloat(i.taxPercentage) : 0,
        })),
      });
      toast.success("Purchase order created");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier *
          </label>
          <select
            className="input-field"
            value={form.supplierId}
            onChange={handleChange("supplierId")}
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
            value={form.warehouseId}
            onChange={handleChange("warehouseId")}
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
            Expected Delivery
          </label>
          <input
            type="date"
            className="input-field"
            value={form.expectedDeliveryDate}
            onChange={handleChange("expectedDeliveryDate")}
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
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Items
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="text-amber-600 text-sm hover:underline font-medium"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Product *
                </label>
                <select
                  className="input-field text-xs"
                  value={item.productId}
                  onChange={handleItemChange(i, "productId")}
                  required
                >
                  <option value="">Select</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  className="input-field text-xs"
                  min="1"
                  value={item.quantityOrdered}
                  onChange={handleItemChange(i, "quantityOrdered")}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Unit Price *
                </label>
                <input
                  type="number"
                  className="input-field text-xs"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={handleItemChange(i, "unitPrice")}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Tax %
                  </label>
                  <input
                    type="number"
                    className="input-field text-xs"
                    value={item.taxPercentage}
                    onChange={handleItemChange(i, "taxPercentage")}
                  />
                </div>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-red-400 hover:text-red-600 mt-5 text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Creating..." : "Create Purchase Order"}
        </button>
      </div>
    </form>
  );
}
