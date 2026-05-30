import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
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
  ArrowLeftRight,
  BookOpen,
  BarChart2,
  TrendingUp,
  Box,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";

const navSections = [
  {
    title: "Overview",
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Inventory",
    items: [
      { to: "/products", icon: Package, label: "Products" },
      { to: "/inventory", icon: Warehouse, label: "Inventory" },
      { to: "/transfer", icon: ArrowLeftRight, label: "Stock Transfer" },
    ],
  },
  {
    title: "Sales",
    items: [
      { to: "/customers", icon: Users, label: "Customers" },
      { to: "/orders", icon: ShoppingCart, label: "Sales Orders" },
      { to: "/dispatch", icon: Bike, label: "Dispatch" },
      { to: "/ledger", icon: BookOpen, label: "Customer Ledger" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/procurement", icon: Truck, label: "Procurement" },
      { to: "/manufacturing", icon: Factory, label: "Manufacturing" },
      { to: "/quality", icon: FlaskConical, label: "Quality Control" },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/finance", icon: Receipt, label: "Invoices" },
      { to: "/expenses", icon: DollarSign, label: "Expenses" },
    ],
  },
  {
    title: "Reports",
    items: [
      { to: "/reports/sales", icon: BarChart2, label: "Sales Report" },
      { to: "/reports/customer", icon: Users, label: "Customer Report" },
      { to: "/reports/product", icon: Box, label: "Product Report" },
      {
        to: "/reports/production",
        icon: ClipboardList,
        label: "Production Report",
      },
      { to: "/reports/profit-loss", icon: TrendingUp, label: "P&L Report" },
      { to: "/reports/gst", icon: ShoppingBag, label: "GST Report" },
    ],
  },
  {
    title: "Admin",
    items: [{ to: "/users", icon: UserCog, label: "Users" }],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState({});

  const toggleSection = (title) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full z-30 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-300 ease-in-out
        w-64
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-amber-600">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-white rounded-lg flex items-center
              justify-center"
            >
              <span className="text-amber-600 font-black text-sm">B</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">
                Brick ERP
              </h1>
              <p className="text-amber-200 text-xs">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-amber-200 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-100 bg-amber-50">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-amber-600 rounded-full flex items-center
              justify-center text-white font-bold text-sm flex-shrink-0"
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.roles?.[0]?.replace("ROLE_", "") || "Staff"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-1">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between
                  px-4 py-2 text-xs font-semibold text-gray-400
                  uppercase tracking-wider hover:text-gray-600
                  transition-colors"
              >
                <span>{section.title}</span>
                {collapsed[section.title] ? (
                  <ChevronRight size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
              </button>

              {/* Section items */}
              {!collapsed[section.title] && (
                <div>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg
                        text-sm font-medium transition-all duration-150
                        ${
                          isActive
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                        }
                      `}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              text-sm font-medium text-red-600 hover:bg-red-50
              transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
