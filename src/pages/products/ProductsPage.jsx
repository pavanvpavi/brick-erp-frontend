import { useEffect, useState } from "react";
import { productApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ProductForm from "./ProductForm";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const pagination = usePagination(filtered, 10);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(res.data.data);
      setFiltered(res.data.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q),
      ),
    );
    pagination.reset();
  }, [search, products]);

  const handleDelete = async () => {
    try {
      await productApi.delete(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Products</h1>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{products.length}</p>
          <p className="text-sm text-gray-500">Total Products</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.isActive).length}
          </p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">
            {[...new Set(products.map((p) => p.categoryName))].length}
          </p>
          <p className="text-sm text-gray-500">Categories</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, SKU..."
          />
          <span className="text-sm text-gray-500">
            {filtered.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">SKU</th>
                <th className="table-header">Name</th>
                <th className="table-header">Category</th>
                <th className="table-header">UOM</th>
                <th className="table-header">Selling Price</th>
                <th className="table-header">Min Stock</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="table-cell font-mono text-xs">{p.sku}</td>
                    <td className="table-cell font-medium">{p.name}</td>
                    <td className="table-cell">{p.categoryName}</td>
                    <td className="table-cell">{p.uomAbbreviation}</td>
                    <td className="table-cell">₹{p.sellingPrice}</td>
                    <td className="table-cell">{p.minimumStockLevel}</td>
                    <td className="table-cell">
                      <span
                        className={p.isActive ? "badge-green" : "badge-red"}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewProduct(p)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditProduct(p);
                            setShowForm(true);
                          }}
                          className="text-gray-400 hover:text-amber-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditProduct(null);
        }}
        title={editProduct ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <ProductForm
          product={editProduct}
          onSuccess={() => {
            setShowForm(false);
            setEditProduct(null);
            fetchProducts();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditProduct(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!viewProduct}
        onClose={() => setViewProduct(null)}
        title="Product Details"
        size="lg"
      >
        {viewProduct && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["SKU", viewProduct.sku],
              ["Name", viewProduct.name],
              ["Category", viewProduct.categoryName],
              ["Unit of Measure", viewProduct.uomName],
              ["Selling Price", `₹${viewProduct.sellingPrice}`],
              ["Cost Price", `₹${viewProduct.costPrice}`],
              ["Tax %", `${viewProduct.taxPercentage}%`],
              ["Material", viewProduct.material],
              ["Color", viewProduct.color],
              ["Strength Grade", viewProduct.strengthGrade],
              [
                "Dimensions (mm)",
                `${viewProduct.lengthMm} × ${viewProduct.widthMm} × ${viewProduct.heightMm}`,
              ],
              ["Weight (kg)", viewProduct.weightKg],
              ["Min Stock Level", viewProduct.minimumStockLevel],
              ["Reorder Qty", viewProduct.reorderQuantity],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium text-gray-800">{value || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
      />
    </div>
  );
}
