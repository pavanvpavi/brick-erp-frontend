import { useEffect, useState } from "react";
import { customerApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import CustomerForm from "./CustomerForm";
import usePagination from "../../hooks/usePagination";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.customerCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const pagination = usePagination(filtered, 10);

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.getAll();
      setCustomers(res.data.data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditCustomer(null);
    fetchCustomers();
  };

  const handleDelete = async () => {
    try {
      await customerApi.delete(deleteId);
      toast.success("Customer deleted");
      setDeleteId(null);
      fetchCustomers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const typeColors = {
    BUSINESS: "badge-blue",
    INDIVIDUAL: "badge-gray",
    CONTRACTOR: "badge-yellow",
    GOVERNMENT: "badge-green",
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Customers</h1>
        <button
          onClick={() => {
            setEditCustomer(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search customers..."
          />
          <span className="text-sm text-gray-500">
            {filtered.length} customers
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Email</th>
                <th className="table-header">City</th>
                <th className="table-header">Credit Days</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                pagination.paginatedData.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">
                      {c.customerCode}
                    </td>
                    <td className="table-cell font-medium">{c.name}</td>
                    <td className="table-cell">
                      <span
                        className={typeColors[c.customerType] || "badge-gray"}
                      >
                        {c.customerType}
                      </span>
                    </td>
                    <td className="table-cell">{c.phone}</td>
                    <td className="table-cell">{c.email}</td>
                    <td className="table-cell">{c.city}</td>
                    <td className="table-cell">{c.creditDays || "—"} days</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const r = await customerApi.getById(c.id);
                            setViewCustomer(r.data.data);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditCustomer(c);
                            setShowForm(true);
                          }}
                          className="text-gray-400 hover:text-amber-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
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
          setEditCustomer(null);
        }}
        title={editCustomer ? "Edit Customer" : "Add Customer"}
        size="lg"
      >
        <CustomerForm
          customer={editCustomer}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditCustomer(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
        title="Customer Details"
        size="lg"
      >
        {viewCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Code", viewCustomer.customerCode],
                ["Name", viewCustomer.name],
                ["Type", viewCustomer.customerType],
                ["Phone", viewCustomer.phone],
                ["Email", viewCustomer.email],
                ["GSTIN", viewCustomer.gstin],
                [
                  "Credit Limit",
                  viewCustomer.creditLimit
                    ? `₹${viewCustomer.creditLimit}`
                    : "—",
                ],
                [
                  "Credit Days",
                  viewCustomer.creditDays
                    ? `${viewCustomer.creditDays} days`
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="font-medium">{value || "—"}</p>
                </div>
              ))}
            </div>
            {viewCustomer.addresses?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Addresses</h3>
                {viewCustomer.addresses.map((a, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <span className="badge-blue mr-2">{a.addressType}</span>
                    {a.addressLine1}, {a.city}, {a.state} - {a.pincode}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
      />
    </div>
  );
}
