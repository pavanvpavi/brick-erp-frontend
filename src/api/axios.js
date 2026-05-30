import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://brick-erp-backend.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      toast.error(
        "Request timed out. Server may be starting up, please try again.",
      );
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("Cannot connect to server. Please check your connection.");
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error("You do not have permission to perform this action.");
      return Promise.reject(error);
    }

    if (status === 404) {
      toast.error(message || "Resource not found.");
      return Promise.reject(error);
    }

    if (status === 409) {
      toast.error(message || "Conflict: This record already exists.");
      return Promise.reject(error);
    }

    if (status === 500) {
      toast.error(message || "Server error. Please try again.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
