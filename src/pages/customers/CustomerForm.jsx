import { useState, useEffect } from "react";
import { customerApi } from "../../api/endpoints";
import toast from "react-hot-toast";

const CUSTOMER_TYPES = ["INDIVIDUAL", "BUSINESS", "CONTRACTOR", "GOVERNMENT"];
const ADDRESS_TYPES = ["BILLING", "SHIPPING", "BOTH"];

const defaultAddress = {
  addressType: "BOTH",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: true,
  contactName: "",
  contactPhone: "",
};

const defaultForm = {
  name: "",
  customerType: "BUSINESS",
  email: "",
  phone: "",
  alternatePhone: "",
  gstin: "",
  pan: "",
  creditLimit: "",
  creditDays: "30",
  notes: "",
  addresses: [{ ...defaultAddress }],
};

export default function CustomerForm({ customer, onSuccess, onCancel }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        customerType: customer.customerType || "BUSINESS",
        email: customer.email || "",
        phone: customer.phone || "",
        alternatePhone: customer.alternatePhone || "",
        gstin: customer.gstin || "",
        pan: customer.pan || "",
        creditLimit: customer.creditLimit || "",
        creditDays: customer.creditDays || "30",
        notes: customer.notes || "",
        addresses:
          customer.addresses?.length > 0
            ? customer.addresses
            : [{ ...defaultAddress }],
      });
    } else {
      setForm(defaultForm);
    }
  }, [customer]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddressChange = (index, field) => (e) => {
    setForm((prev) => {
      const addresses = [...prev.addresses];
      addresses[index] = { ...addresses[index], [field]: e.target.value };
      return { ...prev, addresses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : null,
        creditDays: form.creditDays ? parseInt(form.creditDays) : null,
      };
      if (customer) {
        await customerApi.update(customer.id, payload);
        toast.success("Customer updated successfully");
      } else {
        await customerApi.create(payload);
        toast.success("Customer created successfully");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
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
            Customer Type *
          </label>
          <select
            className="input-field"
            value={form.customerType}
            onChange={handleChange("customerType")}
          >
            {CUSTOMER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            className="input-field"
            value={form.phone}
            onChange={handleChange("phone")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={handleChange("email")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Phone
          </label>
          <input
            type="text"
            className="input-field"
            value={form.alternatePhone}
            onChange={handleChange("alternatePhone")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GSTIN
          </label>
          <input
            type="text"
            className="input-field"
            value={form.gstin}
            onChange={handleChange("gstin")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN
          </label>
          <input
            type="text"
            className="input-field"
            value={form.pan}
            onChange={handleChange("pan")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Limit (₹)
          </label>
          <input
            type="number"
            className="input-field"
            value={form.creditLimit}
            onChange={handleChange("creditLimit")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Days
          </label>
          <input
            type="number"
            className="input-field"
            value={form.creditDays}
            onChange={handleChange("creditDays")}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Address
        </h3>
        {form.addresses.map((addr, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type
              </label>
              <select
                className="input-field"
                value={addr.addressType}
                onChange={handleAddressChange(i, "addressType")}
              >
                {ADDRESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={addr.addressLine1}
                onChange={handleAddressChange(i, "addressLine1")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                className="input-field"
                value={addr.addressLine2 || ""}
                onChange={handleAddressChange(i, "addressLine2")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={addr.city}
                onChange={handleAddressChange(i, "city")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={addr.state}
                onChange={handleAddressChange(i, "state")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={addr.pincode}
                onChange={handleAddressChange(i, "pincode")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                className="input-field"
                value={addr.contactName || ""}
                onChange={handleAddressChange(i, "contactName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                className="input-field"
                value={addr.contactPhone || ""}
                onChange={handleAddressChange(i, "contactPhone")}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving
            ? "Saving..."
            : customer
              ? "Update Customer"
              : "Create Customer"}
        </button>
      </div>
    </form>
  );
}
