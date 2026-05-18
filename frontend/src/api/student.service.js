import api from "./axios.js";

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

export async function getHteReviews(hteId, params = {}) {
  const res = await api.get(`/api/student/htes/${hteId}/reviews`, { params });
  return res.data;
}

export function submitHteReview(hteId, payload) {
  return api.post(`/api/student/htes/${hteId}/reviews`, payload);
}

export async function getStudentProfile() {
  const res = await api.get("/api/student/me");
  return res.data;
}

export async function updateStudentProfile(payload) {
  const res = await api.patch("/api/student/me", payload);
  return res.data;
}

export async function updateStudentPhoto(formData) {
  const res = await api.patch("/api/student/me/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getOjtHubDocuments() {
  const res = await api.get("/api/documents/student/all");
  return res.data;
}

export async function getStudentAnnouncements() {
  const res = await api.get("/api/student/announcements");
  return res.data;
}