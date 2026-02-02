import api from "./axios";
import { setToken, clearToken } from "./token";

/* ================= OTP ================= */

export async function sendOtp(email) {
  const res = await api.post("/api/auth/register", { email });
  return res.data;
}

export async function verifyOtp(email, otp) {
  const res = await api.post("/api/auth/verify-otp", { email, otp });
  return res.data;
}

/* ============ REGISTRATION ============ */

export async function completeRegistration(email, password, confirm_password) {
  const res = await api.post("/api/auth/complete-registration", {
    email,
    password,
    confirm_password,
  });
  return res.data;
}

/* ================= LOGIN ================= */

export async function login(identifier, password) {
  const res = await api.post("/api/auth/login", {
    identifier,
    password,
  });

  // ✅ STORE BOTH TOKEN AND ROLE
  setToken(res.data.access_token, res.data.role);

  return res.data; // { access_token, role }
}

/* ================= SESSION ================= */

export async function me() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

export function logout() {
  clearToken();
}
