import { useState } from "react";
import NavItem from "../navItem";
import { Bell, BellDot, ChevronUp } from "lucide-react";
import HoverLift from "../hoverLift";
import UserDropdownSettings from "../../utilities/userDropdownSettings";
import Notifications from "../../utilities/notifications";
import { ConfirmModal } from "../popupModal";
import { useScrollTop } from "../../hooks/useScrollToTop.jsx";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { getStudentProfile } from "../../api/student.service";
import { useQuery } from "@tanstack/react-query";
import { getRole } from "../../api/token";
import testPfp from "../../assets/testprofile.png";

const API_BASE = api.defaults.baseURL;

export default function StudentNavBar({ notifications = [], setNotifications = () => {} }) {
    const userRole = getRole();
    const isStudent = userRole === "student" || userRole === "STUDENT";

    const { data: profileData } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: getStudentProfile,
        enabled: isStudent,
    });

    const profile = profileData?.profile;
    const photoUrl = profile?.photo_path ? `${API_BASE}${profile.photo_path}` : testPfp;

    const [animationClass, setAnimationClass] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);

    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/access");
    };

    const handleDropdownClick = (dropdown) => {
        setActiveDropdown((prev) => {
            if (prev === dropdown) {
                setAnimationClass("bubble-close");
                return null;
            } else {
                setAnimationClass("bubble-pop");
                return dropdown;
            }
        });
    };

    const hasUnread = notifications.some(n => !n.is_read && !n.is_saved);
    const unreadCount = notifications.filter(n => !n.is_read && !n.is_saved).length;

    const scrolled = useScrollTop(50);

    return (
        <div>
            {confirmation && 
                <ConfirmModal confText="logout?" onLogOut={handleLogout} onCancel={() => setConfirmation(false)}/>
            }
            <div
                className={`
                    fixed top-15 left-0 w-full
                    -translate-y-0
                    hidden md:flex
                    flex-row justify-between items-center px-5 py-3
                    transition-all duration-300 ease-in-out z-100
                    ${scrolled 
                        ? "hidden backdrop-blur-lg bg-white/40 shadow-lg -translate-y-15" 
                        : "bg-white shadow-md"
                    }
                `}
            >
                <ul className="w-full p-3 hidden md:flex flex-row justify-center items-center gap-15">
                    <NavItem to="/home" label="Home" isOpen={true} variant="header"/>
                    <NavItem to="/htedirectory" label="HTE Directory" isOpen={true} variant="header"/>
                    <NavItem to="/ojthub" label="OJT Hub" isOpen={true} variant="header"/>
                    <NavItem to="/announcements" label="Announcement" isOpen={true} variant="header"/>

                    {/* NOTIFICATIONS & PROFILE (SCROLLED) */}
                    <div className={`flex gap-3 items-center absolute right-0 p-5 transition-all duration-300 ${scrolled ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"}`}>
                        <HoverLift onClick={() => handleDropdownClick("notifs")}>
                                <div className="relative cursor-pointer">
                                    {hasUnread ? (
                                        <BellDot className="hidden md:block lg:block" size={28} color="#54A194"/>
                                    ) : (
                                        <Bell className="hidden md:block lg:block" size={28} color="#54A194" />
                                    )}

                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-oasis-red text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </div>
                        </HoverLift>

                        <HoverLift 
                            onClick={() => handleDropdownClick("profile")}
                        >
                            <img
                            className="w-8 rounded-full object-cover aspect-square hidden md:block lg:block cursor-pointer"
                            src={photoUrl}
                            alt="Profile"
                            />
                        </HoverLift>
                    </div>
                </ul>
            </div>

            {activeDropdown === "profile" && (
                <UserDropdownSettings
                    open={activeDropdown === "profile"}
                    onClose={() => setActiveDropdown(null)}
                    className={animationClass}
                    items={[
                        { text: "Profile", to: "/student-profile" },
                        { text: "Log out", onClick: () => setConfirmation(true) },
                    ]}
                />
            )}

            {activeDropdown === "notifs" && (
                <Notifications
                    open={activeDropdown === "notifs"}
                    onClose={() => setActiveDropdown(null)}
                    notifications={notifications}
                    setNotifications={setNotifications}
                />
            )}
            
            {scrolled && (
                <div className="animate__animate animate__bounceIn fixed p-3 rounded-full bg-oasis-header shadow-[0px_0px_5px_rgba(0,0,0,0.5)] bottom-5 left-5 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 z-150 transition ease-in-out duration-150 cursor-pointer">
                    <ChevronUp size={30} color="white" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}/>
                </div>
            )}
        </div>
    );
}
