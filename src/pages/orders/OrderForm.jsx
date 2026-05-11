import { useState, useEffect } from "react";
import {
  orderApi,
  customerApi,
  productApi,
  inventoryApi,
} from "../../api/endpoints";
import toast from "react-hot-toast";

export default function OrderForm({ onSuccess, onCancel }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    warehouseId: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [
      { productId: "", quantity: "", unitPrice: "", discountPercentage: "" },
    ],
  });

  useEffect(() => {
    customerApi.getAll().then((r) => setCustomers(r.data.data));
    productApi.getAll().then((r) => setProducts(r.data.data));
    inventoryApi.getWarehouses().then((r) => setWarehouses(r.data.data));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", quantity: "", unitPrice: "", discountPercentage: "" },
      ],
    }));

  const removeItem = (i) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));

  const handleItemChange = (index, field) => (e) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: e.target.value };
      if (field === "productId") {
        const p = products.find((p) => p.id === parseInt(e.target.value));
        if (p) items[index].unitPrice = p.sellingPrice;
      }
      return { ...prev, items };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await orderApi.create({
        customerId: parseInt(form.customerId),
        warehouseId: parseInt(form.warehouseId),
        expectedDeliveryDate: form.expectedDeliveryDate || null,
        notes: form.notes,
        items: form.items.map((i) => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity),
          unitPrice: i.unitPrice ? parseFloat(i.unitPrice) : null,
          discountPercentage: i.discountPercentage
            ? parseFloat(i.discountPercentage)
            : null,
        })),
      });
      toast.success("Order created successfully");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            className="input-field"
            value={form.customerId}
            onChange={handleChange("customerId")}
            required
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

      {/* Items */}
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
                  value={item.quantity}
                  onChange={handleItemChange(i, "quantity")}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Unit Price
                </label>
                <input
                  type="number"
                  className="input-field text-xs"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={handleItemChange(i, "unitPrice")}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    className="input-field text-xs"
                    step="0.01"
                    value={item.discountPercentage}
                    onChange={handleItemChange(i, "discountPercentage")}
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
          {saving ? "Creating..." : "Create Order"}
        </button>
      </div>
    </form>
  );
}
