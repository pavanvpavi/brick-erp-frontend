import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  ShoppingCart,
  Truck,
  Factory,
  Receipt,
  UserCog,
  LogOut,
  Bike,
  FlaskConical,
  DollarSign,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/inventory", icon: Warehouse, label: "Inventory" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/orders", icon: ShoppingCart, label: "Sales Orders" },
  { to: "/procurement", icon: Truck, label: "Procurement" },
  { to: "/manufacturing", icon: Factory, label: "Manufacturing" },
  { to: "/quality", icon: FlaskConical, label: "Quality Control" },
  { to: "/dispatch", icon: Bike, label: "Dispatch" },
  { to: "/finance", icon: Receipt, label: "Finance" },
  { to: "/expenses", icon: DollarSign, label: "Expenses" },
  { to: "/users", icon: UserCog, label: "Users" },
];

export default function Sidebar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧱</span>
          <div>
            <h1 className="font-bold text-lg leading-none">Brick ERP</h1>
            <p className="text-gray-400 text-xs mt-0.5">Manufacturing System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.fullName?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full px-2 py-1.5 rounded transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
