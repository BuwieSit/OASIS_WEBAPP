import LogoWrap from "../utilities/logoWrap";
import oasisLogo from "../assets/oasisLogo.png";
import NavItem from "./navItem";
import HoverLift from "./hoverLift";
import { useState, useEffect } from "react";
import { CircleUserRound, Bell, BellDot, LayoutDashboard, ChevronLeft, Cog, FileText, Upload, Users, LogOut, Menu, MenuIcon, User, UserRoundCog } from "lucide-react";
import Notifications from "../utilities/notifications";
import { UserRound, BellIcon } from "lucide-react";
import api from "../api/axios.jsx";
import Subtitle from "../utilities/subtitle";
import UserDropdownSettings from "../utilities/userDropdownSettings";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "./popupModal";
import testPfp from "../assets/testprofile.png"
import { useScrollTop } from "../hooks/useScrollToTop.jsx";

const API_BASE = api.defaults.baseURL;

export function Header({ admin = false }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [open, setOpen] = useState(false);

    const [animationClass, setAnimationClass] = useState("");
    const [openSettings, setOpenSettings] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (dropdownName) => {
        setActiveDropdown(prev =>
            prev === dropdownName ? null : dropdownName
        );
    };
    
    const handleSettingsClick = () => {
        if (openSettings) {
            setAnimationClass("bubble-close");
            setOpenSettings(false);
        }
        else {
            requestAnimationFrame(() => setAnimate(true));
            setAnimationClass("bubble-pop");
            setOpenSettings(true)
        }
    }
    const handleNotifClick = () => {
        requestAnimationFrame(() => setAnimate(true));
        setOpen(prev => !prev);
    }

    useEffect(() => {
        async function fetchProfile() {
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

        fetchProfile();
    }, []);

    useEffect(() => {
        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await NotificationAPI.getStudentNotifications();
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        }
    };

    const [notifications, setNotifications] = useState([]);
    const hasUnread = notifications.some(n => !n.is_read && !n.is_saved);

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
                {/* VINCENT */}
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

                    <HoverLift onClick={handleNotifClick}>
                        {!admin && (
                            <div>
                                {hasUnread ? (
                                    <BellDot className="hidden md:block lg:block" size={28} color="#54A194" />
                                ) : (
                                    <Bell className="hidden md:block lg:block" size={28} color="#54A194" />
                                )}
                            </div>
                        )}
                    </HoverLift>

                    <HoverLift onClick={handleSettingsClick}>
                    {!admin && (
                        <img
                        className="w-8 rounded-full object-cover aspect-square hidden md:block lg:block"
                        src={profile.photo_url}
                        alt="Profile"
                        />
                    )}
                    </HoverLift>
                    
                    
                    <Menu onClick={() => toggleDropdown("menu")} className="md:hidden lg:hidden absolute left-[5%] cursor-pointer" color="#54A194" />
                    <UserRoundCog onClick={() => toggleDropdown("profile")} className="md:hidden lg:hidden absolute right-[5%] cursor-pointer" color="#54A194"/>
                </div>
            </header>
        }
            {activeDropdown === "menu" && <NavigationDropdown/>}
            {activeDropdown === "profile" && <ProfileDropdown/>}
            {openSettings && <UserDropdownSettings
                    open={openSettings}
                    className={animationClass}
                    items={[
                        { text: "Profile", to: "/student-profile" },
                        { text: "Log out" },
                    ]}
                />}
            {open && <Notifications open={open} onClose={() => setOpen(false)}/>}

        </>
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
                    {/* VINCENT */}
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
                    {/* PROFILE */}
                    <NavItem 
                        to={"/admin-profile"}
                        isTrigger={true} 
                        isOpen={isOpen} 
                        label={"Buwie Santos"} 
                        iconLeft={<UserRound color="#2B6259"/>}
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

export function StudentHeader({ showNavigation = true }) {
    const scrolled = useScrollTop(50);

    return (
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

                {/* {scrolled ? "" : ""} */}
            </ul>
        </div>
    );
}

export function NavigationDropdown() {
    return (
        <>
            <div className={`fixed w-50 h-full p-5 block md:hidden lg:hidden aspect-square backdrop-blur-md bg-white/30 shadow-lg left-0 top-15 -translate-x-[0%] -translate-y-[0%] z-100 transition-all duration-300 ease-in-out rounded-b-3xl`}>
                <ul className="w-full flex flex-col gap-5 items-start justify-center">
                    <NavItem to="/home" label="Home" isOpen={true}/>
                    <NavItem to="/htedirectory" label="HTE Directory" isOpen={true}/>
                    <NavItem to="/ojthub" label="OJT Hub" isOpen={true}/>
                    <NavItem to="/announcements" label="Announcement" isOpen={true}/>
                </ul>     
            </div>
        </>
    )
}

export function ProfileDropdown() {
    return (
        <>
            <div className={`fixed w-50 h-full p-5 block md:hidden lg:hidden aspect-square backdrop-blur-md bg-white/30 shadow-lg right-0 top-15 -translate-x-[0%] -translate-y-[0%] z-100 transition-all duration-300 ease-in-out rounded-b-3xl`}>
                <ul className="w-full flex flex-col gap-5 items-start justify-center">
                    <NavItem to="/student-profile" label="Profile" isOpen={true}/>
                    <NavItem isTrigger={true} label="Notifications" isOpen={true}/>
                    <NavItem isTrigger={true} label="Log out" isOpen={true}/>
                </ul>     
            </div>
        </>
    )
}