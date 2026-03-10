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

    updateMoaProspectStatus(id, status) {
        return api.patch(`/api/admin/moa-prospects/${id}/status`, { status });
    },

    approveMoaProspect(id) {
        return api.patch(`/api/admin/moa-prospects/${id}/approve`);
    },

    rejectMoaProspect(id) {
        return api.patch(`/api/admin/moa-prospects/${id}/reject`);
    },

    downloadHTEsExcel(status) {
        return api.get("/api/admin/htes/export", {
            params: status ? { status } : {},
            responseType: "blob",
        });
    },

    uploadHTEsExcel(file) {
        const formData = new FormData();
        formData.append("file", file);
        return api.post("/api/admin/htes/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    getReviews(params = {}) {
        return api.get("/api/admin/reviews", { params });
    },

    approveReview(id) {
        return api.patch(`/api/admin/reviews/${id}/approve`);
    },

    rejectReview(id) {
        return api.patch(`/api/admin/reviews/${id}/reject`);
    },

    approveAllReviews(params = {}) {
        return api.post("/api/admin/reviews/approve-all", null, { params });
    },
    
    clearAllPendingReviews(params = {}) {
        return api.post("/api/admin/reviews/clear-all", null, { params });
    },

    getDocuments(section) {
        return api.get(`/api/documents/admin/${section}`);
    },

    saveDocuments(section, items) {
        return api.post("/api/documents/admin/save", {
            section,
            items
        });
    },

    clearDocuments(section) {
        return api.delete(`/api/documents/admin/${section}/clear`);
    },

    uploadDocument(section, title, file) {
        const formData = new FormData();

        formData.append("section", section);
        formData.append("title", title);
        formData.append("file", file);

        return api.post("/api/documents/admin/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    archiveStudent(id) {
        return api.patch(`/api/admin/students/${id}/archive`);
    },

    unarchiveStudent(id) {
        return api.patch(`/api/admin/students/${id}/unarchive`);
    },
};

