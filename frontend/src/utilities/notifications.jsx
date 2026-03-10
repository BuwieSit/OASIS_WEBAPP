import { Filter } from "../components/adminComps";
import Subtitle from "./subtitle";
import { CircleX } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { NotificationAPI } from "../api/notification.api";

export default function Notifications({ open, onClose }) {
    const [show, setShow] = useState(false);
    const [animationClass, setAnimationClass] = useState("");

    const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(false);

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

    const filteredNotifications = useMemo(() => {
        if (activeFilter === "Unread") {
            return notifications.filter((item) => !item.is_read);
        }
        return notifications;
    }, [notifications, activeFilter]);

    const formatRelativeTime = (dateString) => {
        if (!dateString) return "";

        const createdDate = new Date(dateString);
        const now = new Date();
        const diffMs = now - createdDate;

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;

        return createdDate.toLocaleDateString();
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

                <CircleX
                    className="absolute right-[5%] cursor-pointer"
                    color="#54A194"
                    size={30}
                    onClick={handleClose}
                />
            </section>

            <div className="mt-3 h-[85%] overflow-y-auto pr-2">
                {loading ? (
                    <div className="w-full p-3">
                        <Subtitle text={"Loading notifications..."} />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="w-full p-3 rounded-2xl shadow-[0px_0px_5px_rgba(0,0,0,0.5)] bg-white">
                        <Subtitle
                            text={
                                activeFilter === "Unread"
                                    ? "No unread notifications."
                                    : "No notifications yet."
                            }
                        />
                    </div>
                ) : (
                    filteredNotifications.map((item) => (
                        <div
                            key={item.id}
                            className={`w-full p-3 rounded-2xl flex flex-col gap-3 mt-3 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] mb-3 ${
                                item.is_read ? "bg-white" : "bg-[#EAF7F4]"
                            }`}
                        >
                            <section className="flex w-full justify-between items-center gap-3">
                                <Subtitle
                                    text={item.title || "Notification"}
                                    weight={"font-bold"}
                                    size={"text-[0.9rem]"}
                                />
                                <Subtitle
                                    text={formatRelativeTime(item.created_at)}
                                    size={"text-[0.75rem]"}
                                />
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