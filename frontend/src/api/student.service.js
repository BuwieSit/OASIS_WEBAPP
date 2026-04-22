import api from "./axios.jsx";

export async function fetchHTEs(params = {}) {
  const res = await api.get("/api/student/htes", { params });
  return res.data.htes;
}

export async function fetchHTEById(hteId) {
  const res = await api.get(`/api/student/htes/${hteId}`);
  return res.data;
}

export function downloadMOA(hteId) {
  return api.get(`/api/student/htes/${hteId}/moa?download=1`, {
    responseType: "blob",
  });
}

export function getMOAFileUrl(hteId) {
  return `${import.meta.env.VITE_API_URL}/api/student/htes/${hteId}/moa`;
}

export function submitMoaProspect(formData) {
  return api.post("/api/student/moa-prospects", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getHteReviews(hteId, params = {}) {
  return api.get(`/api/student/htes/${hteId}/reviews`, { params });
}

export function submitHteReview(hteId, payload) {
  return api.post(`/api/student/htes/${hteId}/reviews`, payload);
}