import { useState, useEffect } from "react";
import { manufacturingApi, inventoryApi } from "../../api/endpoints";
import toast from "react-hot-toast";

export default function ProductionOrderForm({ onSuccess, onCancel }) {
  const [boms, setBoms] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bomId: "",
    plannedQuantity: "",
    warehouseId: "",
    plannedStartDate: "",
    plannedEndDate: "",
    notes: "",
  });

  useEffect(() => {
    manufacturingApi.getBoms().then((r) => setBoms(r.data.data));
    inventoryApi.getWarehouses().then((r) => setWarehouses(r.data.data));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await manufacturingApi.createProductionOrder({
        bomId: parseInt(form.bomId),
        plannedQuantity: parseInt(form.plannedQuantity),
        warehouseId: parseInt(form.warehouseId),
        plannedStartDate: form.plannedStartDate || null,
        plannedEndDate: form.plannedEndDate || null,
        notes: form.notes,
      });
      toast.success("Production order created");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bill of Materials *
        </label>
        <select
          className="input-field"
          value={form.bomId}
          onChange={handleChange("bomId")}
          required
        >
          <option value="">Select BOM</option>
          {boms.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.finishedProductName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Planned Quantity *
        </label>
        <input
          type="number"
          className="input-field"
          min="1"
          required
          value={form.plannedQuantity}
          onChange={handleChange("plannedQuantity")}
        />
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planned Start
          </label>
          <input
            type="date"
            className="input-field"
            value={form.plannedStartDate}
            onChange={handleChange("plannedStartDate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planned End
          </label>
          <input
            type="date"
            className="input-field"
            value={form.plannedEndDate}
            onChange={handleChange("plannedEndDate")}
          />
        </div>
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
      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Creating..." : "Create Production Order"}
        </button>
      </div>
    </form>
  );
}
