import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, Bell } from "lucide-react";
import useAuthStore from "../../store/authStore";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header
          className="bg-white border-b border-gray-200 px-4 py-3
          flex items-center justify-between flex-shrink-0 z-10"
        >
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500
                hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500">
                Welcome back,{" "}
                <span className="font-semibold text-gray-800">
                  {user?.username}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              className="p-2 rounded-lg text-gray-500
              hover:bg-gray-100 transition-colors relative"
            >
              <Bell size={18} />
            </button>

            {/* User avatar */}
            <div
              className="w-8 h-8 bg-amber-600 rounded-full
              flex items-center justify-center text-white
              font-bold text-sm"
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
