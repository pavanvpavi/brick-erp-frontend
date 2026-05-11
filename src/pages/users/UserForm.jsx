import { useState } from "react";
import { authApi } from "../../api/endpoints";
import toast from "react-hot-toast";

const ALL_ROLES = [
  "ROLE_ADMIN",
  "ROLE_MANAGER",
  "ROLE_SALES",
  "ROLE_PURCHASE",
  "ROLE_WAREHOUSE",
  "ROLE_ACCOUNTS",
  "ROLE_VIEWER",
];

export default function UserForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    roles: ["ROLE_VIEWER"],
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleRole = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }
    setSaving(true);
    try {
      await authApi.register(form);
      toast.success("User created successfully");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username *
        </label>
        <input
          type="text"
          className="input-field"
          required
          value={form.username}
          onChange={handleChange("username")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          className="input-field"
          required
          value={form.fullName}
          onChange={handleChange("fullName")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          className="input-field"
          required
          value={form.email}
          onChange={handleChange("email")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <input
          type="password"
          className="input-field"
          required
          minLength={6}
          value={form.password}
          onChange={handleChange("password")}
        />
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roles *
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                form.roles.includes(role)
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {role.replace("ROLE_", "")}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
