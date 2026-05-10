import api from "./axios.jsx";

export const NotificationAPI = {
  async getStudentNotifications() {
    const res = await api.get("/api/student/notifications");
    return res.data;
  },

  markAsRead(notificationId) {
    return api.patch(`/api/student/notifications/${notificationId}/read`);
  },

  toggleSave(notificationId) {
    return api.patch(`/api/student/notifications/${notificationId}/save`);
  }
};