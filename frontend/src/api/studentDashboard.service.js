import api from "./axios";

export async function getStudentDashboardHTEs() {
  const res = await api.get("/api/student/dashboard/htes");
  return res.data.htes;
}