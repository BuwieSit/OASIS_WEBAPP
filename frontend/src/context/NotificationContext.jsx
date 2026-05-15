import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { GeneralPopupModal } from "../components/popupModal";

const NotificationContext = createContext();

export const SHOW_NOTIFICATION_EVENT = "SHOW_GLOBAL_NOTIFICATION";

/**
 * Utility to trigger a notification from anywhere (e.g., axios interceptors)
 */
export const triggerNotification = (payload) => {
    window.dispatchEvent(new CustomEvent(SHOW_NOTIFICATION_EVENT, { detail: payload }));
};

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback(({ title, text, type = "neutral", time = 3000, icon }) => {
        setNotification({ title, text, type, time, icon });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Listen for custom events to show notifications from non-react files
    useEffect(() => {
        const handler = (event) => {
            showNotification(event.detail);
        };
        window.addEventListener(SHOW_NOTIFICATION_EVENT, handler);
        return () => window.removeEventListener(SHOW_NOTIFICATION_EVENT, handler);
    }, [showNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {notification && (
                <GeneralPopupModal
                    {...notification}
                    isSuccess={notification.type === "success"}
                    isFailed={notification.type === "failed"}
                    isNeutral={notification.type === "neutral"}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
