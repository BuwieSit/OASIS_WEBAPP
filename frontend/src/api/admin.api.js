import api from "./axios.js";

export const AdminAPI = {
    // Dashboard
    async getDashboard() {
        const res = await api.get("/api/admin/dashboard");
        return res.data;
    },

    // Announcements
    async getAnnouncements() {
        const res = await api.get("/api/admin/announcements");
        return res.data;
    },

    createAnnouncement(payload) {
        return api.post("/api/admin/announcements", payload);
    },

    deleteAnnouncement(id) {
        return api.delete(`/api/admin/announcements/${id}`);
    },

    // Admin alerts
    async getAdminAlerts() {
        const res = await api.get("/api/admin/alerts");
        return res.data;
    },

    async getStudents(params = {}) {
        const res = await api.get("/api/admin/students", { params });
        return res.data;
    },

    async getHTEs(status) {
        const res = await api.get("/api/admin/htes", {
            params: status ? { status } : {}
        });
        return res.data;
    },

    createHTE(formData) {
        return api.post("/api/admin/htes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
        });
    },
    
    async getMoas() {
        const res = await api.get("/api/admin/moas");
        return res.data;
    },

    async getMoaProspects() {
        const res = await api.get("/api/admin/moa-prospects");
        return res.data;
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

    downloadHTEsExcel(status, config = {}) {
        return api.get("/api/admin/htes/export", {
            params: status ? { status } : {},
            responseType: "blob",
            ...config
        });
    },

    async uploadHTEsExcel(file, config = {}) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/api/admin/htes/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            ...config
        });
        return res.data;
    },

    async getReviews(params = {}) {
        const res = await api.get("/api/admin/reviews", { params });
        return res.data;
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

    async getDocuments(section) {
        const res = await api.get(`/api/documents/admin/${section}`);
        return res.data;
    },

    async saveDocuments(section, items) {
        const res = await api.post("/api/documents/admin/save", {
            section,
            items
        });
        return res.data;
    },

    async clearDocuments(section) {
        const res = await api.delete(`/api/documents/admin/${section}/clear`);
        return res.data;
    },

    async uploadDocument(section, title, file) {
        const formData = new FormData();

        formData.append("section", section);
        formData.append("title", title);
        formData.append("file", file);

        const res = await api.post("/api/documents/admin/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res.data;
    },

    archiveStudent(id) {
        return api.patch(`/api/admin/students/${id}/archive`);
    },

    unarchiveStudent(id) {
        return api.patch(`/api/admin/students/${id}/unarchive`);
    },

    getMoaFileBlob(id) {
        return api.get(`/api/admin/moas/${id}/file`, {
            responseType: "blob"
        });
    }
};



