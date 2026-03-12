import { Filter } from "../components/adminComps";
import Subtitle from "./subtitle";
import { CircleX, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { NotificationAPI } from "../api/notification.api";

export default function Notifications({ 
    open,
    onClose,
    notifications,
    setNotifications 
}) {
    const [show, setShow] = useState(false);
    const [animationClass, setAnimationClass] = useState("");

    // const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (open) {
            setShow(true);
            setAnimationClass("bubble-pop");
        } else {
            setAnimationClass("bubble-close");

            const timeout = setTimeout(() => {
                setShow(false);
            }, 200);

            return () => clearTimeout(timeout);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [open]);

    const loadNotifications = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const res = await NotificationAPI.getStudentNotifications();
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setNotifications([]);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const parseNotificationDate = (dateString) => {
        if (!dateString) return null;

        if (dateString.endsWith("Z")) {
            return new Date(dateString);
        }

        return new Date(`${dateString}Z`);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const res = await NotificationAPI.markAsRead(notificationId);
            const updated = res?.data?.notification;

            if (!updated) return;

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notificationId ? updated : item
                )
            );
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const handleToggleSave = async (e, notificationId) => {
        e.stopPropagation();

        try {
            setProcessingId(notificationId);

            const res = await NotificationAPI.toggleSave(notificationId);
            const updated = res?.data?.notification;

            if (!updated) return;

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notificationId ? updated : item
                )
            );
        } catch (err) {
            console.error("Failed to toggle save notification:", err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleNotificationClick = async (item) => {
        await handleMarkAsRead(item.id);
    };

    const filteredNotifications = useMemo(() => {
        if (activeFilter === "Unread") {
            return notifications.filter((item) => !item.is_read && !item.is_saved);
        }

        if (activeFilter === "Saved") {
            return notifications.filter((item) => item.is_saved);
        }

        return notifications.filter((item) => !item.is_saved);
    }, [notifications, activeFilter]);

    const formatRelativeTime = (dateString) => {
        if (!dateString) return "";

        const createdDate = parseNotificationDate(dateString);

        if (!createdDate || Number.isNaN(createdDate.getTime())) {
            return "";
        }

        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();

        if (diffMs < 0) return "Just now";

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return createdDate.toLocaleDateString();
    };

    const getEmptyStateText = () => {
        if (activeFilter === "Unread") return "No unread notifications.";
        if (activeFilter === "Saved") return "No saved notifications.";
        return "No notifications yet.";
    };

    const handleClose = () => {
        setAnimationClass("bubble-close");
        setTimeout(() => {
            if (onClose) onClose();
        }, 200);
    };

    if (!show) return null;

    return (
        <div
            className={`w-100 h-[70%] p-5 fixed top-1/2 right-0 -translate-x-[10%] -translate-y-[55%] bg-[rgba(255,255,255,0.5)] backdrop-blur-2xl z-150 rounded-3xl shadow-[0px_0px_5px_rgba(0,0,0,0.5)] ${animationClass}`}
        >
            <section className="w-full flex flex-row justify-start items-center gap-5 px-3">
                <div onClick={() => setActiveFilter("All")}>
                    <Filter text={"All"} isActive={activeFilter === "All"} />
                </div>

                <div onClick={() => setActiveFilter("Unread")}>
                    <Filter text={"Unread"} isActive={activeFilter === "Unread"} />
                </div>

                <div onClick={() => setActiveFilter("Saved")}>
                    <Filter text={"Saved"} isActive={activeFilter === "Saved"} />
                </div>

                <CircleX
                    className="absolute right-[5%] cursor-pointer"
                    color="#54A194"
                    size={30}
                    onClick={handleClose}
                />
            </section>

            <div className="mt-3 h-[85%] overflow-y-auto overflow-x-auto pr-2">
                {loading ? (
                    <div className="w-full p-3">
                        <Subtitle text={"Loading notifications..."} />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="w-full p-3 rounded-2xl shadow-[0px_0px_5px_rgba(0,0,0,0.5)] bg-white">
                        <Subtitle text={getEmptyStateText()} />
                    </div>
                ) : (
                    filteredNotifications.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`w-full p-3 rounded-2xl flex flex-col gap-3 mt-3 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] mb-3 cursor-pointer transition-all ${
                                item.is_read ? "bg-white" : "bg-[#EAF7F4]"
                            }`}
                        >
                            <section className="flex w-full justify-between items-start gap-3">
                                <div className="flex-1">
                                    <Subtitle
                                        text={item.title || "Notification"}
                                        weight={"font-bold"}
                                        size={"text-[0.9rem]"}
                                    />
                                    <Subtitle
                                        text={formatRelativeTime(item.created_at)}
                                        size={"text-[0.75rem]"}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => handleToggleSave(e, item.id)}
                                    disabled={processingId === item.id}
                                    className="cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition"
                                    title={item.is_saved ? "Unsave notification" : "Save notification"}
                                >
                                    {item.is_saved ? (
                                        <BookmarkCheck size={18} color="#54A194" />
                                    ) : (
                                        <Bookmark size={18} color="#54A194" />
                                    )}
                                </button>
                            </section>

                            <Subtitle
                                text={item.message || "No message available."}
                                size={"text-[0.85rem]"}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}