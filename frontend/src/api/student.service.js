import api from "./axios";

export async function fetchHTEs(params = {}) {
  const res = await api.get("/api/student/htes", { params });
  return res.data.htes;
}

export function downloadMOA(hteId) {
  return api.get(`/api/student/htes/${hteId}/moa`, {
    responseType: "blob",
  });
}