import { useState, useEffect } from "react";
import { manufacturingApi, productApi } from "../../api/endpoints";
import toast from "react-hot-toast";

export default function BomForm({ onSuccess, onCancel }) {
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    finishedProductId: "",
    name: "",
    version: "v1",
    outputQuantity: "",
    description: "",
    isDefault: false,
    bomItems: [{ materialProductId: "", quantityRequired: "", notes: "" }],
  });

  useEffect(() => {
    productApi.getAll().then((r) => setProducts(r.data.data));
  }, []);

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field) => (e) => {
    setForm((prev) => {
      const bomItems = [...prev.bomItems];
      bomItems[index] = { ...bomItems[index], [field]: e.target.value };
      return { ...prev, bomItems };
    });
  };

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      bomItems: [
        ...prev.bomItems,
        { materialProductId: "", quantityRequired: "", notes: "" },
      ],
    }));

  const removeItem = (i) =>
    setForm((prev) => ({
      ...prev,
      bomItems: prev.bomItems.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await manufacturingApi.createBom({
        finishedProductId: parseInt(form.finishedProductId),
        name: form.name,
        version: form.version,
        outputQuantity: parseInt(form.outputQuantity),
        description: form.description,
        isDefault: form.isDefault,
        bomItems: form.bomItems.map((i) => ({
          materialProductId: parseInt(i.materialProductId),
          quantityRequired: parseFloat(i.quantityRequired),
          notes: i.notes,
        })),
      });
      toast.success("BOM created successfully");
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
            Finished Product *
          </label>
          <select
            className="input-field"
            value={form.finishedProductId}
            onChange={handleChange("finishedProductId")}
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
            BOM Name *
          </label>
          <input
            type="text"
            className="input-field"
            required
            value={form.name}
            onChange={handleChange("name")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Version
          </label>
          <input
            type="text"
            className="input-field"
            value={form.version}
            onChange={handleChange("version")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Output Quantity *
          </label>
          <input
            type="number"
            className="input-field"
            min="1"
            required
            value={form.outputQuantity}
            onChange={handleChange("outputQuantity")}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            className="input-field"
            value={form.description}
            onChange={handleChange("description")}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={form.isDefault}
            onChange={handleChange("isDefault")}
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700">
            Set as Default BOM
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Raw Materials
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="text-amber-600 text-sm hover:underline font-medium"
          >
            + Add Material
          </button>
        </div>
        <div className="space-y-2">
          {form.bomItems.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Material *
                </label>
                <select
                  className="input-field text-xs"
                  value={item.materialProductId}
                  onChange={handleItemChange(i, "materialProductId")}
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
                  Quantity Required *
                </label>
                <input
                  type="number"
                  className="input-field text-xs"
                  step="0.01"
                  min="0"
                  value={item.quantityRequired}
                  onChange={handleItemChange(i, "quantityRequired")}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    className="input-field text-xs"
                    value={item.notes}
                    onChange={handleItemChange(i, "notes")}
                  />
                </div>
                {form.bomItems.length > 1 && (
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
          {saving ? "Creating..." : "Create BOM"}
        </button>
      </div>
    </form>
  );
}
