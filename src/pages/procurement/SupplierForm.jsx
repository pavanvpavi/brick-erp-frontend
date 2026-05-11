import { useState, useEffect } from "react";
import { procurementApi } from "../../api/endpoints";
import toast from "react-hot-toast";

export default function SupplierForm({ supplier, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    gstin: "",
    pan: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    paymentTermsDays: "30",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        alternatePhone: supplier.alternatePhone || "",
        gstin: supplier.gstin || "",
        pan: supplier.pan || "",
        addressLine1: supplier.addressLine1 || "",
        city: supplier.city || "",
        state: supplier.state || "",
        pincode: supplier.pincode || "",
        paymentTermsDays: supplier.paymentTermsDays || "30",
        notes: supplier.notes || "",
      });
    }
  }, [supplier]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        paymentTermsDays: parseInt(form.paymentTermsDays),
      };
      if (supplier) {
        await procurementApi.updateSupplier(supplier.id, payload);
        toast.success("Supplier updated");
      } else {
        await procurementApi.createSupplier(payload);
        toast.success("Supplier created");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ["Name *", "name", "text", true],
    ["Contact Person", "contactPerson", "text", false],
    ["Email", "email", "email", false],
    ["Phone", "phone", "text", false],
    ["GSTIN", "gstin", "text", false],
    ["PAN", "pan", "text", false],
    ["Address", "addressLine1", "text", false],
    ["City", "city", "text", false],
    ["State", "state", "text", false],
    ["Pincode", "pincode", "text", false],
    ["Payment Terms (Days)", "paymentTermsDays", "number", false],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(([label, field, type, required]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type={type}
              className="input-field"
              required={required}
              value={form[field]}
              onChange={handleChange(field)}
            />
          </div>
        ))}
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
          {saving
            ? "Saving..."
            : supplier
              ? "Update Supplier"
              : "Create Supplier"}
        </button>
      </div>
    </form>
  );
}
