import api from "./axios.jsx";

export async function getStudentDashboardHTEs() {
  const res = await api.get("/api/student/htes/dashboard");
  return res.data;
}
