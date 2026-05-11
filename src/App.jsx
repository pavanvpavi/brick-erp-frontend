import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import CustomersPage from "./pages/customers/CustomersPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ProcurementPage from "./pages/procurement/ProcurementPage";
import ManufacturingPage from "./pages/manufacturing/ManufacturingPage";
import FinancePage from "./pages/finance/FinancePage";
import UsersPage from "./pages/users/UsersPage";
import DispatchPage from "./pages/dispatch/DispatchPage";
import QualityPage from "./pages/quality/QualityPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="procurement" element={<ProcurementPage />} />
          <Route path="manufacturing" element={<ManufacturingPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
