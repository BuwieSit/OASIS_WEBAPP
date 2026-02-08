import api from "./axios.jsx";

export const AdminAPI = {
    // Dashboard
    getDashboard() {
        return api.get("/api/admin/dashboard");
    },

    // Announcements
    getAnnouncements() {
        return api.get("/api/admin/announcements");
    },

    createAnnouncement(payload) {
        return api.post("/api/admin/announcements", payload);
    },

    deleteAnnouncement(id) {
        return api.delete(`/api/admin/announcements/${id}`);
    },

    // Admin alerts
    getAdminAlerts() {
        return api.get("/api/admin/alerts");
    },

    getStudents(params = {}) {
        return api.get("/api/admin/students", { params });
    },

    getHTEs(status) {
        return api.get("/api/admin/htes", {
        params: status ? { status } : {}
    });
    },

    createHTE(formData) {
        return api.post("/api/admin/htes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
        });
    },
    getMoas() {
        return api.get("/api/admin/moas");
    },

    getMoaProspects() {
        return api.get("/api/admin/moa-prospects");
    },
};