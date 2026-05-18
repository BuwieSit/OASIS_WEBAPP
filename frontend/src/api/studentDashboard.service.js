import api from "./axios.js";

export async function getStudentDashboardHTEs() {
  const res = await api.get("/api/student/htes/dashboard");
  return res.data;
}
