import { useEffect, useState } from "react";
import { authApi } from "../../api/endpoints";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import UserForm from "./UserForm";
import toast from "react-hot-toast";
import { Plus, Lock, Unlock } from "lucide-react";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";

const ROLE_COLORS = {
  ROLE_SUPER_ADMIN: "badge-red",
  ROLE_ADMIN: "badge-blue",
  ROLE_MANAGER: "badge-purple",
  ROLE_SALES: "badge-green",
  ROLE_PURCHASE: "badge-yellow",
  ROLE_WAREHOUSE: "badge-gray",
  ROLE_ACCOUNTS: "badge-blue",
  ROLE_VIEWER: "badge-gray",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const pagination = usePagination(users, 10);

  const fetchUsers = async () => {
    try {
      const res = await authApi.getUsers();
      setUsers(res.data.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLock = async (id, isLocked) => {
    try {
      if (isLocked) {
        await authApi.unlockUser(id);
        toast.success("User unlocked");
      } else {
        await authApi.lockUser(id);
        toast.success("User locked");
      }
      fetchUsers();
    } catch {
      toast.error("Operation failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">User Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="table-header">Username</th>
                <th className="table-header">Full Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Roles</th>
                <th className="table-header">Status</th>
                <th className="table-header">Created</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="table-cell font-medium font-mono">
                    {u.username}
                  </td>
                  <td className="table-cell">{u.fullName}</td>
                  <td className="table-cell">{u.email}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((role) => (
                        <span
                          key={role}
                          className={`${ROLE_COLORS[role] || "badge-gray"} text-xs`}
                        >
                          {role.replace("ROLE_", "")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span
                      className={
                        u.isLocked
                          ? "badge-red"
                          : u.isActive
                            ? "badge-green"
                            : "badge-gray"
                      }
                    >
                      {u.isLocked
                        ? "Locked"
                        : u.isActive
                          ? "Active"
                          : "Inactive"}
                    </span>
                  </td>
                  <td className="table-cell text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleLock(u.id, u.isLocked)}
                      className={`${
                        u.isLocked
                          ? "text-gray-400 hover:text-green-600"
                          : "text-gray-400 hover:text-red-600"
                      } transition-colors`}
                      title={u.isLocked ? "Unlock User" : "Lock User"}
                    >
                      {u.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add User"
        size="sm"
      >
        <UserForm
          onSuccess={() => {
            setShowForm(false);
            fetchUsers();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
