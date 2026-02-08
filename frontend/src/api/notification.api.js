import api from "./axios.jsx";

export const NotificationAPI = {
  getStudentNotifications() {
    return api.get("/api/student/notifications");
  }
};