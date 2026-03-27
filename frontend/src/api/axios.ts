import axios from "axios";
import { emitLogout } from "./authEvents";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:3000
  withCredentials: false, // set true only if using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Attach token automatically
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor
 * Centralized error handling
 */
api.interceptors.response.use(
  (response) => response, // just return response if successful
  (error) => {
    if (!error.response) {
      // Network error, server unreachable
      window.dispatchEvent(
        new CustomEvent("global:error", {
          detail: "Cannot connect to server. Please try again.",
        }),
      );
    } else if (error.response.status === 401 || error.response.status === 403) {
      // Unauthorized: token expired or invalid
      localStorage.removeItem("token");
      emitLogout();
    } else if (error.response.status >= 500) {
      // Server error
      window.dispatchEvent(
        new CustomEvent("global:error", {
          detail: "Something went wrong. Please try again.",
        }),
      );
    } else if (error.response.status >= 400 && error.response.status < 500) {
      // Client errors like 400, 422, etc.
      const message =
        error.response.data?.message ||
        "Invalid request. Please check your input.";
      window.dispatchEvent(
        new CustomEvent("global:error", {
          detail: message,
        }),
      );
    }

    return Promise.reject(error); // still propagate to component if needed
  },
);

export default api;
