import { useEffect, useState } from "react";
import { productApi } from "../../api/endpoints";
import toast from "react-hot-toast";

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    uomId: "",
    lengthMm: "",
    widthMm: "",
    heightMm: "",
    weightKg: "",
    strengthGrade: "",
    material: "",
    color: "",
    sellingPrice: "",
    costPrice: "",
    taxPercentage: "18",
    minimumStockLevel: "0",
    reorderQuantity: "0",
  });

  useEffect(() => {
    productApi.getCategories().then((r) => setCategories(r.data.data));
    productApi.getUoms().then((r) => setUoms(r.data.data));
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        uomId: product.uomId || "",
        lengthMm: product.lengthMm ?? "",
        widthMm: product.widthMm ?? "",
        heightMm: product.heightMm ?? "",
        weightKg: product.weightKg ?? "",
        strengthGrade: product.strengthGrade || "",
        material: product.material || "",
        color: product.color || "",
        sellingPrice: product.sellingPrice ?? "",
        costPrice: product.costPrice ?? "",
        taxPercentage: product.taxPercentage ?? "0",
        minimumStockLevel: product.minimumStockLevel ?? "0",
        reorderQuantity: product.reorderQuantity ?? "0",
      });
    } else {
      setForm({
        sku: "",
        name: "",
        description: "",
        categoryId: "",
        uomId: "",
        lengthMm: "",
        widthMm: "",
        heightMm: "",
        weightKg: "",
        strengthGrade: "",
        material: "",
        color: "",
        sellingPrice: "",
        costPrice: "",
        taxPercentage: "18",
        minimumStockLevel: "0",
        reorderQuantity: "0",
      });
    }
  }, [product]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        categoryId: parseInt(form.categoryId),
        uomId: parseInt(form.uomId),
        sellingPrice: parseFloat(form.sellingPrice),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        taxPercentage: parseFloat(form.taxPercentage),
        minimumStockLevel: parseInt(form.minimumStockLevel),
        reorderQuantity: parseInt(form.reorderQuantity),
        lengthMm: form.lengthMm ? parseFloat(form.lengthMm) : null,
        widthMm: form.widthMm ? parseFloat(form.widthMm) : null,
        heightMm: form.heightMm ? parseFloat(form.heightMm) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      };
      if (product) {
        await productApi.update(product.id, payload);
        toast.success("Product updated successfully");
      } else {
        await productApi.create(payload);
        toast.success("Product created successfully");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={form.sku}
                onChange={handleChange("sku")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={form.name}
                onChange={handleChange("name")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={form.description}
                onChange={handleChange("description")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                className="input-field"
                required
                value={form.categoryId}
                onChange={handleChange("categoryId")}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure *
              </label>
              <select
                className="input-field"
                required
                value={form.uomId}
                onChange={handleChange("uomId")}
              >
                <option value="">Select UOM</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.abbreviation})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Specifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (mm)
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                value={form.lengthMm}
                onChange={handleChange("lengthMm")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                value={form.widthMm}
                onChange={handleChange("widthMm")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                value={form.heightMm}
                onChange={handleChange("heightMm")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                value={form.weightKg}
                onChange={handleChange("weightKg")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strength Grade
              </label>
              <input
                type="text"
                className="input-field"
                value={form.strengthGrade}
                onChange={handleChange("strengthGrade")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <input
                type="text"
                className="input-field"
                value={form.material}
                onChange={handleChange("material")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                className="input-field"
                value={form.color}
                onChange={handleChange("color")}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Pricing
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                required
                value={form.sellingPrice}
                onChange={handleChange("sellingPrice")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (₹)
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                value={form.costPrice}
                onChange={handleChange("costPrice")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax %
              </label>
              <input
                type="number"
                className="input-field"
                step="any"
                value={form.taxPercentage}
                onChange={handleChange("taxPercentage")}
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Inventory Control
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level
              </label>
              <input
                type="number"
                className="input-field"
                value={form.minimumStockLevel}
                onChange={handleChange("minimumStockLevel")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Quantity
              </label>
              <input
                type="number"
                className="input-field"
                value={form.reorderQuantity}
                onChange={handleChange("reorderQuantity")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Saving..."
            : product
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}
