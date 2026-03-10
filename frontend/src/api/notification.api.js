import api from "./axios.jsx";

export const NotificationAPI = {
  getStudentNotifications() {
    return api.get("/api/student/notifications");
  },

  markAsRead(notificationId) {
    return api.patch(`/api/student/notifications/${notificationId}/read`);
  },

  toggleSave(notificationId) {
    return api.patch(`/api/student/notifications/${notificationId}/save`);
  }
};