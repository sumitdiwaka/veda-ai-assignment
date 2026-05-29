import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Normal API calls
const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Long running calls (create assignment)
export const apiLong = axios.create({
  baseURL: BASE,
  timeout: 300000, // 5 minutes
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message || "Something went wrong"))
);

apiLong.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message || "Something went wrong"))
);

export default api;