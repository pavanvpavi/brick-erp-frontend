export const API_BASE_URL = "http://localhost:8080/api/v1";

export const ORDER_STATUS_COLORS = {
  DRAFT: "badge-gray",
  CONFIRMED: "badge-blue",
  PROCESSING: "badge-yellow",
  SHIPPED: "badge-yellow",
  DELIVERED: "badge-green",
  CANCELLED: "badge-red",
};

export const INVOICE_STATUS_COLORS = {
  DRAFT: "badge-gray",
  SENT: "badge-blue",
  PARTIALLY_PAID: "badge-yellow",
  PAID: "badge-green",
  OVERDUE: "badge-red",
  CANCELLED: "badge-red",
};

export const PO_STATUS_COLORS = {
  DRAFT: "badge-gray",
  SENT: "badge-blue",
  PARTIALLY_RECEIVED: "badge-yellow",
  RECEIVED: "badge-green",
  CANCELLED: "badge-red",
};

export const PRODUCTION_STATUS_COLORS = {
  PLANNED: "badge-gray",
  IN_PROGRESS: "badge-yellow",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
};
