import axios from "axios";

// ============================================================
// 🔹 Axios Global Defaults
// ============================================================
axios.defaults.withCredentials = true;

// ============================================================
// 🔹 Backend URL (Switch Dev/Prod)
// ============================================================
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com"
    : "http://localhost:8000";

// ============================================================
// 🔹 Axios Instance
// ============================================================
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// 🔹 User Authentication & Face APIs
// ============================================================

/**
 * Register a new user with required face image
 */
export const registerUser = async (username, password, fileBlob) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  if (fileBlob) {
    formData.append("file", fileBlob, `${username}.jpg`);
  }
  try {
    const res = await API.post("/register/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // Should contain { success, error }
  } catch (err) {
    return { success: false, error: err?.response?.data?.detail || "Registration error" };
  }
};

/**
 * Login using username & password only (JSON)
 */
export const loginUser = async (username, password) => {
  try {
    const res = await API.post("/login", { username, password });
    return res.data;
  } catch (err) {
    return { success: false, error: err?.response?.data?.detail || "Login error" };
  }
};

/**
 * Verify face + password login
 */
export const verifyFace = async (username, password, fileBlob, tolerance = 0.6) => {
  const formData = new FormData();
  formData.append("password", password);
  formData.append("file", fileBlob);

  const url = `/verify/${encodeURIComponent(username)}?tolerance=${tolerance}`;
  try {
    const res = await API.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err?.response?.data?.detail || "Face verification error" };
  }
};

/**
 * Logout (server clears auth cookies)
 */
export const logoutUser = async () => {
  await API.post("/logout");
};

/**
 * Get current authenticated user profile
 */
export const getProfile = async () => {
  const res = await API.get("/me");
  return res.data;
};

/**
 * Example call to a protected route
 */
export const protectedRoute = async () => {
  const res = await API.get("/protected");
  return res.data;
};

export default API;
