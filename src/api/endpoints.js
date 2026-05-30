import api from "./axios";

// Auth
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getUsers: () => api.get("/auth/users"),
  getCurrentUser: () => api.get("/auth/me"),
  lockUser: (id) => api.post(`/auth/users/${id}/lock`),
  unlockUser: (id) => api.post(`/auth/users/${id}/unlock`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  updateRoles: (id, roles) => api.put(`/auth/users/${id}/roles`, roles),
};

// Products
export const productApi = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  search: (keyword) => api.get(`/products/search?keyword=${keyword}`),
  getCategories: () => api.get("/product-categories"),
  createCategory: (data) => api.post("/product-categories", data),
  getUoms: () => api.get("/uom"),
  createUom: (data) => api.post("/uom", data),
};

// Inventory
export const inventoryApi = {
  getWarehouses: () => api.get("/warehouses"),
  createWarehouse: (data) => api.post("/warehouses", data),
  getStockByWarehouse: (id) => api.get(`/stock/warehouse/${id}`),
  getStockByProduct: (id) => api.get(`/stock/product/${id}`),
  getLowStock: () => api.get("/stock/low-stock"),
  adjustStock: (data) => api.post("/stock/adjust", data),
  getMovements: (productId) => api.get(`/stock/movements/product/${productId}`),
};

// Customers
export const customerApi = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  search: (keyword) => api.get(`/customers/search?keyword=${keyword}`),
};

// Sales Orders
export const orderApi = {
  getAll: () => api.get("/sales-orders"),
  getById: (id) => api.get(`/sales-orders/${id}`),
  create: (data) => api.post("/sales-orders", data),
  confirm: (id) => api.post(`/sales-orders/${id}/confirm`),
  cancel: (id, reason) =>
    api.post(`/sales-orders/${id}/cancel?reason=${reason}`),
  updateStatus: (id, data) => api.patch(`/sales-orders/${id}/status`, data),
  getByStatus: (status) => api.get(`/sales-orders/status/${status}`),
};

// Procurement
export const procurementApi = {
  getSuppliers: () => api.get("/suppliers"),
  createSupplier: (data) => api.post("/suppliers", data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  getPurchaseOrders: () => api.get("/purchase-orders"),
  getPurchaseOrderById: (id) => api.get(`/purchase-orders/${id}`),
  createPurchaseOrder: (data) => api.post("/purchase-orders", data),
  sendToSupplier: (id) => api.post(`/purchase-orders/${id}/send`),
  receiveItems: (id, data) => api.post(`/purchase-orders/${id}/receive`, data),
  cancelPurchaseOrder: (id) => api.post(`/purchase-orders/${id}/cancel`),
};

// Manufacturing
export const manufacturingApi = {
  getBoms: () => api.get("/boms"),
  createBom: (data) => api.post("/boms", data),
  getProductionOrders: () => api.get("/production-orders"),
  getProductionOrderById: (id) => api.get(`/production-orders/${id}`),
  createProductionOrder: (data) => api.post("/production-orders", data),
  startProduction: (id) => api.post(`/production-orders/${id}/start`),
  completeProduction: (id, data) =>
    api.post(`/production-orders/${id}/complete`, data),
  cancelProduction: (id) => api.post(`/production-orders/${id}/cancel`),
};

// Finance
export const financeApi = {
  getAll: () => api.get("/invoices"),
  getById: (id) => api.get(`/invoices/${id}`),
  createFromOrder: (data) => api.post("/invoices/from-order", data),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),
  recordPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  cancelInvoice: (id) => api.post(`/invoices/${id}/cancel`),
  getByStatus: (status) => api.get(`/invoices/status/${status}`),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getSalesReport: (start, end) =>
    api.get(`/dashboard/reports/sales?startDate=${start}&endDate=${end}`),
  getInventoryReport: () => api.get("/dashboard/reports/inventory"),
  getFinanceReport: () => api.get("/dashboard/reports/finance"),
};

// Dispatch
export const dispatchApi = {
  getAll: () => api.get("/deliveries"),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post("/deliveries", data),
  dispatch: (id) => api.post(`/deliveries/${id}/dispatch`),
  markDelivered: (id, data) => api.post(`/deliveries/${id}/deliver`, data),
  markFailed: (id, reason) =>
    api.post(`/deliveries/${id}/fail?reason=${reason}`),
  getByStatus: (status) => api.get(`/deliveries/status/${status}`),
};

// Quality
export const qualityApi = {
  getAll: () => api.get("/quality-tests"),
  getById: (id) => api.get(`/quality-tests/${id}`),
  create: (data) => api.post("/quality-tests", data),
  getByProduct: (id) => api.get(`/quality-tests/product/${id}`),
};

// Expenses
export const expenseApi = {
  getAll: () => api.get("/expenses"),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getByCategory: (cat) => api.get(`/expenses/category/${cat}`),
  getTotal: (start, end) =>
    api.get(`/expenses/total?start=${start}&end=${end}`),
};

// Stock Transfer
export const stockTransferApi = {
  getAll: () => api.get("/stock-transfers"),
  getById: (id) => api.get(`/stock-transfers/${id}`),
  create: (data) => api.post("/stock-transfers", data),
  cancel: (id, reason) =>
    api.post(`/stock-transfers/${id}/cancel?reason=${reason}`),
  getByProduct: (id) => api.get(`/stock-transfers/product/${id}`),
  getByWarehouse: (id) => api.get(`/stock-transfers/warehouse/${id}`),
};

// Customer Ledger
export const ledgerApi = {
  getCustomerLedger: (customerId) => api.get(`/customers/${customerId}/ledger`),
};

// Supplier Price History
export const priceHistoryApi = {
  getBySupplier: (supplierId) =>
    api.get(`/suppliers/${supplierId}/price-history`),
  getBySupplierAndProduct: (supplierId, productId) =>
    api.get(`/suppliers/${supplierId}/price-history/product/${productId}`),
};

// GST Report

export const reportsApi = {
  getGstReport: (start, end) =>
    api.get(`/reports/gst?startDate=${start}&endDate=${end}`),
  getSalesReport: (start, end) =>
    api.get(`/reports/sales?startDate=${start}&endDate=${end}`),
  getCustomerSalesReport: (customerId, start, end) =>
    api.get(
      `/reports/sales/customer/${customerId}?startDate=${start}&endDate=${end}`,
    ),
  getProductSalesReport: (productId, start, end) =>
    api.get(
      `/reports/sales/product/${productId}?startDate=${start}&endDate=${end}`,
    ),
  getProductionReport: (start, end) =>
    api.get(`/reports/production?startDate=${start}&endDate=${end}`),
  getProfitLossReport: (start, end) =>
    api.get(`/reports/profit-loss?startDate=${start}&endDate=${end}`),
};

// PDF Downloads
export const pdfApi = {
  downloadInvoice: (id) =>
    api.get(`/pdf/invoice/${id}`, { responseType: "blob" }),
  downloadPurchaseOrder: (id) =>
    api.get(`/pdf/purchase-order/${id}`, { responseType: "blob" }),
  downloadDeliveryChallan: (id) =>
    api.get(`/pdf/delivery/${id}`, { responseType: "blob" }),
};
