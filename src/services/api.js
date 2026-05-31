import axios from "axios";

// Always use HTTPS for Railway
const API_BASE_URL = "https://smart-link-api.sefa-inventory.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
  withCredentials: true, // Change to false for Railway
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("🔑 Request:", config.method?.toUpperCase(), config.url);
    console.log("🔑 Full URL:", config.baseURL + config.url);
    console.log("🔑 Token exists:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Auth header set");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error("❌ Response error:", status, url);

    if (status === 401) {
      console.warn("🔒 401 Unauthorized detected");

      const isAuthEndpoint = url?.includes("/auth/");
      const isLoginPage = window.location.pathname.includes("/login");

      if (!isAuthEndpoint && !isLoginPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
