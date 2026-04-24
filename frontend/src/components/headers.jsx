import LogoWrap from "../utilities/logoWrap";
import oasisLogo from "../assets/oasisLogo.png";
import NavItem from "./navItem";
import HoverLift from "./hoverLift";
import { useState, useEffect, useRef } from "react";
import { Bell, BellDot, LayoutDashboard, ChevronLeft, Cog, FileText, Upload, Users, LogOut, Menu, UserRoundCog, ChevronUp } from "lucide-react";
import Notifications from "../utilities/notifications";
import { UserRound, BellIcon } from "lucide-react";
import api from "../api/axios.jsx";
import Subtitle from "../utilities/subtitle";
import UserDropdownSettings from "../utilities/userDropdownSettings";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmModal } from "./popupModal";
import { useScrollTop } from "../hooks/useScrollToTop.jsx";
import { NotificationAPI } from "../api/notification.api";
import { AnnounceButton } from "./button.jsx";
import useOutsideClick from "../utilities/OutsideClick";

import { getRole } from "../api/token";

const API_BASE = api.defaults.baseURL;

export function Header({ admin, notifications = [], setNotifications = () => {} }) {
    const userRole = getRole();
    const isStudent = userRole === "student" || userRole === "STUDENT";
    
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);

    const [animationClass, setAnimationClass] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);

    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/access")
    }
    
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

    useEffect(() => {
        async function fetchProfile() {
            if (!isStudent) return;
            try{
                const res = await api.get("/api/student/me");
                const fetchedProfile = res.data.profile;
                    
                // ✅ NORMALIZE IMAGE URL ON FETCH
                if (fetchedProfile?.photo_path) {
                    fetchedProfile.photo_url = `${API_BASE}${fetchedProfile.photo_path}`;
                    setHasProfile(true);
                } else {
                    setHasProfile(false);
                }
                setUser(res.data.user);
                setProfile(fetchedProfile);
                setHasProfile(true);
                    
                }
            catch (err) {
                console.error("Profile fetch failed:", err);
            }
            
        }
        fetchProfile();
    }, [isStudent]);

    const hasUnread = notifications.some(n => !n.is_read && !n.is_saved);
    const unreadCount = notifications.filter(n => !n.is_read && !n.is_saved).length;
    
    if (!admin && (!user || !profile)) return null;

    return (
        <>
        {admin ? 
            <header className="sticky top-0 w-full h-5 flex flex-row justify-between
            items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-90">
                <LogoWrap />
                <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto"/>
                <Subtitle text={"Admin"} color={"text-[#3E8679]"} size={"text-[1rem]"}/> 
            </header>
            : 
        
            // STUDENT HEADER
            <header className="fixed md:sticky lg:sticky top-0 w-full h-5 flex flex-row justify-between
            items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-90">

                <LogoWrap />
                <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto"/>
                
                <div className="flex gap-3 items-center">
                    <HoverLift>
                        {!admin && (
                            <Subtitle 
                                isLink 
                                link={"#prospectForm"} 
                                text={"Submit MOA Prospect"}
                                size={"text-md"}
                                weight={"font-bold"}
                                color={"text-oasis-header"}
                                isMobile={true}
                            />
                        )}
                    </HoverLift>

                    <HoverLift onClick={() => handleDropdownClick("notifs")}>
                        {!admin && (
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
                        )}
                    </HoverLift>

                    <HoverLift 
                        onClick={() => handleDropdownClick("profile")}
                    >
                        {!admin && (
                            <img
                            className="w-8 rounded-full object-cover aspect-square hidden md:block lg:block"
                            src={profile?.photo_url}
                            alt="Profile"
                            />
                        )}
                    </HoverLift>
                    
                    {/* MOBILE */}
                    <Menu onClick={() => toggleDropdown("menu")} className="md:hidden lg:hidden absolute left-[5%] cursor-pointer" color="#54A194" />
    
                    
                </div>
            </header>
        }

            {/* MOBILE */}
            <div className="block md:hidden">
                {confirmation && 
                    <ConfirmModal confText="logout?" onLogOut={handleLogout} onCancel={() => setConfirmation(false)}/>
                }
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
                {activeDropdown === "notifs" && (
                    <Notifications
                        open={activeDropdown === "notifs"}
                        onClose={() => setActiveDropdown(null)}
                        notifications={notifications}
                        setNotifications={setNotifications}
                    />
                )}
            </div>

            {/* DESKTOP */}
            <div className="hidden md:block">
                {activeDropdown === "profile" && (
                    <UserDropdownSettings
                        open={activeDropdown === "profile"}
                        onClose={() => setActiveDropdown(null)}
                        className={animationClass}
                        items={[{ text: "Profile", to: "/student-profile" }, { text: "Log out" }]}
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
            </div>
        </>
    )
}

export function LandingHeader() {
    return (
        <header className="sticky top-0 w-full h-5 flex flex-row justify-between
        items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-90">
            <LogoWrap />
            <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto"/> 
        </header>
    )
}

export function AdminNavigation({ isOpen, setIsOpen}) {

    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/access")
    }

    return (
        <>
            {confirmation && 
                <ConfirmModal confText="logout?" onLogOut={handleLogout} onCancel={() => setConfirmation(false)}/>
            }
            <div className={`fixed left-0 top-0 z-100 h-screen p-3 bg-white grid grid-cols-1 place-items-start shadow-[0px_0px_10px_rgba(0,0,0,0.5)] transition-all duration-150 ease-in-out overflow-hidden ${isOpen ? "sm:w-[180px] md:w-[200px] lg:w-[260px]":"sm:w-[60px] md:w-[60px] lg:w-[70px]"} w-[260px]`}>

                <img src={oasisLogo} className="sm:w-20 md:w-30 lg:w-50 object-cover aspect-video place-self-start"/>
                <div className="cursor-pointer rounded-full p-2 transition-all duration-100 ease-in-out flex justify-center items-center hover:bg-oasis-button-light" onClick={() => setIsOpen(!isOpen)}>

                    <ChevronLeft size={30} className={`transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
                    />  
                </div>
                <ul className="text-black w-full p-3 flex flex-col justify-center items-start gap-5 col-span-2 list-none">

                    <NavItem 
                        to="/admin" 
                        label="Dashboard" 
                        iconLeft={<LayoutDashboard color={"#2B6259"}/>} 
                        isOpen={isOpen} 
                    />
                    <NavItem 
                        to="/admoperations" 
                        label="Operations" 
                        iconLeft={<Cog color={"#2B6259"}/>} 
                        isOpen={isOpen} 
                    />
                    <NavItem 
                        to="/admMoaOverview" 
                        label="MOA Overview" 
                        iconLeft={<FileText color={"#2B6259"}/>} 
                        isOpen={isOpen} 
                    />
                    <NavItem 
                        to="/admUploads" 
                        label="Document Upload" 
                        iconLeft={<Upload color={"#2B6259"}/>} 
                        isOpen={isOpen} 
                    />

                    <NavItem 
                        to="/admStudents" 
                        label="Students" 
                        iconLeft={<Users color={"#2B6259"}/>} 
                        isOpen={isOpen} 
                    />

                </ul>

                {/* Icons */}
                <div className="p-3 rounded-4xl w-fit flex flex-col justify-between items-start gap-5 list-none">

                    <NavItem 
                        isTrigger={true} 
                        isOpen={isOpen} 
                        label={"Notifications"} 
                        iconLeft={<BellIcon 
                        color="#2B6259"/>}
                    />
                    
                    <NavItem 
                        isNotLink={true}
                        isOpen={isOpen} 
                        label={"Logout"} 
                        iconLeft={<LogOut color="#2B6259"/>}
                        onClick={() => setConfirmation(true)}
                    />
                </div>
            </div>
        </>
    )
}

export function StudentHeader({ showNavigation = true, notifications = [], setNotifications = () => {} }) {
    const userRole = getRole();
    const isStudent = userRole === "student" || userRole === "STUDENT";

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);

    const [animationClass, setAnimationClass] = useState("");
    const [activeDropdown, setActiveDropdown] = useState(null);

    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/access")
    }

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

    useEffect(() => {
        async function fetchProfile() {
            if (!isStudent) return;
            try {
                const res = await api.get("/api/student/me");
                const fetchedProfile = res.data.profile;
                    
                // ✅ NORMALIZE IMAGE URL ON FETCH
                if (fetchedProfile?.photo_path) {
                    fetchedProfile.photo_url = `${API_BASE}${fetchedProfile.photo_path}`;
                    setHasProfile(true);
                } else {
                    setHasProfile(false);
                }
                setUser(res.data.user);
                setProfile(fetchedProfile);
                setHasProfile(true);
            } catch (err) {
                console.warn("Student profile fetch failed (Localhost check):", err.message);
            }
        }

        fetchProfile();
    }, [isStudent]);

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
                <NavItem to="/home" label="Home" isOpen={true}/>
                <NavItem to="/htedirectory" label="HTE Directory" isOpen={true}/>
                <NavItem to="/ojthub" label="OJT Hub" isOpen={true}/>
                <NavItem to="/announcements" label="Announcement" isOpen={true}/>

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
                        src={profile?.photo_url}
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
            {scrolled ? 
                <div className="animate__animate animate__bounceIn fixed p-3 rounded-full bg-oasis-header shadow-[0px_0px_5px_rgba(0,0,0,0.5)] bottom-5 left-5 md:bottom-15 md:left-15 lg:bottom-15 lg:left-15 z-150 transition ease-in-out duration-150 cursor-pointer">
                    <ChevronUp size={30} color="white" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}/>
                </div> : ""
            }
            
        </div>
        
    );
}

export function NavigationDropdown({ onClose, onLogout, onNotifications, unreadCount }) {
    return (
        <div 
            className={`fixed w-64 h-fit p-5 block md:hidden lg:hidden backdrop-blur-md bg-white/80 shadow-2xl left-0 top-15 z-100 transition-all duration-300 ease-in-out rounded-br-3xl`}
        >
            <ul className="w-full flex flex-col gap-6 items-start justify-center list-none">
                <Subtitle text="Navigation" size="text-[0.7rem]" color="text-gray-400" className="mt-2 uppercase tracking-widest"/>
                <NavItem to="/home" label="Home" isOpen={true} onClick={onClose}/>
                <NavItem to="/htedirectory" label="HTE Directory" isOpen={true} onClick={onClose}/>
                <NavItem to="/ojthub" label="OJT Hub" isOpen={true} onClick={onClose}/>
                <NavItem to="/announcements" label="Announcement" isOpen={true} onClick={onClose}/>
                
                <hr className="w-full border-gray-100" />
                
                <Subtitle text="User" size="text-[0.7rem]" color="text-gray-400" className="mt-2 uppercase tracking-widest"/>
                <NavItem to="/student-profile" label="Profile" isOpen={true} onClick={onClose}/>
                <NavItem 
                    isNotLink={true} 
                    label="Notifications" 
                    isOpen={true} 
                    onClick={onNotifications}
                    iconRight={unreadCount > 0 && (
                        <span className="bg-oasis-red text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full ml-2">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                />
                <NavItem isNotLink={true} label="Log out" isOpen={true} onClick={onLogout}/>
            </ul>     
        </div>
    )
}

export function ProfileDropdown({ onLogout, onNotifications, onClose, unreadCount }) {
    return (
        <div 
            className={`fixed w-64 h-fit p-5 block md:hidden lg:hidden backdrop-blur-md bg-white/80 shadow-2xl right-0 top-15 z-100 transition-all duration-300 ease-in-out rounded-bl-3xl`}
        >
            <ul className="w-full flex flex-col gap-6 items-start justify-center list-none">
                <Subtitle text="Account" size="text-[0.7rem]" color="text-gray-400" className="mt-2 uppercase tracking-widest"/>
                <NavItem to="/student-profile" label="Profile" isOpen={true} onClick={onClose}/>
                <NavItem 
                    isNotLink={true} 
                    label="Notifications" 
                    isOpen={true} 
                    onClick={onNotifications}
                    iconRight={unreadCount > 0 && (
                        <span className="bg-oasis-red text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full ml-2">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                />
                <NavItem isNotLink={true} label="Log out" isOpen={true} onClick={onLogout}/>
            </ul>     
        </div>
    )
}