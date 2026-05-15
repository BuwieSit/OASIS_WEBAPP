import axios from "axios";
import { getToken, clearToken } from "./token";
import { triggerNotification } from "../context/NotificationContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    if (response) {
      const status = response.status;
      const message = response.data?.message || response.data?.error || "An unexpected error occurred.";

      switch (status) {
        case 401:

          if (config.url.includes("/login")) {
            triggerNotification({
              title: "Login Failed",
              text: message || "Invalid email or password.",
              type: "failed"
            });
          } else {
            // Unauthorized
            const hasToken = !!getToken();
            const onAccessPage = window.location.pathname.includes("/access");
            const onLandingPage = window.location.pathname === "/";

            if (hasToken && !onAccessPage && !onLandingPage) {
              triggerNotification({
                title: "Session Expired",
                text: "Please log in again to continue.",
                type: "failed",
                time: 5000
              });
            }

            clearToken();

            if (!onAccessPage && !onLandingPage) {
              window.location.href = "/access";
            }
          }
          break;

        case 403:

          triggerNotification({
            title: "Access Denied",
            text: "You do not have permission to perform this action.",
            type: "failed"
          });
          break;

        case 404:

          triggerNotification({
            title: "Not Found",
            text: message || "The requested resource was not found.",
            type: "failed"
          });
          break;

        case 422:

          triggerNotification({
            title: "Validation Error",
            text: message,
            type: "failed"
          });
          break;

        case 500:

          triggerNotification({
            title: "Server Error",
            text: "Something went wrong on our end. Please try again later.",
            type: "failed"
          });
          break;

        default:

          triggerNotification({
            title: "Error",
            text: message,
            type: "failed"
          });
      }
    } else if (error.request) {

      triggerNotification({
        title: "Network Error",
        text: "Could not reach the server. Please check your internet connection.",
        type: "failed"
      });
    }

    return Promise.reject(error);
  }
);

export default api;
