import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoWrap from "../../utilities/logoWrap";
import oasisLogo from "../../assets/oasisLogo.png";
import testPfp from "../../assets/testprofile.png";
import HoverLift from "../hoverLift";
import { Bell, BellDot, Menu } from "lucide-react";
import api from "../../api/axios.js";
import Subtitle from "../../utilities/subtitle";
import UserDropdownSettings from "../../utilities/userDropdownSettings";
import Notifications from "../../utilities/notifications";
import { ConfirmModal } from "../popupModal";
import { useAuth } from "../../context/authContext";
import { getStudentProfile } from "../../api/student.service";
import { useQuery } from "@tanstack/react-query";
import { getRole } from "../../api/token";
import { NavigationDropdown, ProfileDropdown } from "./MobileMenu";

const API_BASE = api.defaults.baseURL;

export default function StudentHeader({ notifications = [], setNotifications = () => {} }) {
    const userRole = getRole();
    const isStudent = userRole === "student" || userRole === "STUDENT";
    
    const { data: profileData } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: getStudentProfile,
        enabled: isStudent,
    });

    const user = profileData?.user;
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
    
    const toggleDropdown = (name) => {
        setActiveDropdown((prev) => (prev === name ? null : name));
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
    
    if (!user || !profile) return null;

    return (
        <>
            <header className="fixed md:sticky lg:sticky top-0 w-full h-5 flex flex-row justify-between
            items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-90">

                <LogoWrap />
                <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto" alt="Oasis Logo"/>
                
                <div className="flex gap-3 items-center">
                    <HoverLift>
                        <Subtitle 
                            isLink 
                            link={"#prospectForm"} 
                            text={"Submit MOA Prospect"}
                            size={"text-md"}
                            weight={"font-bold"}
                            color={"text-oasis-header"}
                            isMobile={true}
                        />
                    </HoverLift>

                    <HoverLift onClick={() => handleDropdownClick("notifs")}>
                        <div className="relative hidden md:block">
                            {hasUnread ? (
                                <BellDot size={28} color="#54A194"/>
                            ) : (
                                <Bell size={28} color="#54A194" />
                            )}

                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-oasis-red text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </div>
                    </HoverLift>

                    <HoverLift onClick={() => handleDropdownClick("profile")}>
                        <img
                            className="w-8 rounded-full object-cover aspect-square hidden md:block lg:block cursor-pointer"
                            src={photoUrl}
                            alt="Profile"
                        />
                    </HoverLift>
                    
                    {/* MOBILE MENU TOGGLE */}
                    <Menu onClick={() => toggleDropdown("menu")} className="md:hidden lg:hidden absolute left-[5%] cursor-pointer" color="#54A194" />
                </div>
            </header>

            {confirmation && (
                <ConfirmModal 
                    confText="logout?" 
                    onLogOut={handleLogout} 
                    onCancel={() => setConfirmation(false)}
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

            {/* MOBILE ONLY DROPDOWNS */}
            <div className="block md:hidden">
                {activeDropdown === "menu" && (
                    <NavigationDropdown 
                        onClose={() => setActiveDropdown(null)} 
                        onLogout={() => {
                            setConfirmation(true);
                            setActiveDropdown(null);
                        }} 
                        onNotifications={() => setActiveDropdown("notifs")}
                        unreadCount={unreadCount}
                    />
                )}
                {activeDropdown === "profile" && (
                    <ProfileDropdown 
                        onClose={() => setActiveDropdown(null)}
                        onLogout={() => {
                            setConfirmation(true);
                            setActiveDropdown(null);
                        }} 
                        onNotifications={() => setActiveDropdown("notifs")} 
                        unreadCount={unreadCount}
                    />
                )}
            </div>

            {/* DESKTOP ONLY DROPDOWNS */}
            <div className="hidden md:block">
                {activeDropdown === "profile" && (
                    <UserDropdownSettings
                        open={activeDropdown === "profile"}
                        onClose={() => setActiveDropdown(null)}
                        className={animationClass}
                        items={[{ text: "Profile", to: "/student-profile" }, { text: "Log out", onClick: () => setConfirmation(true) }]}
                    />
                )}
            </div>
        </>
    );
}
