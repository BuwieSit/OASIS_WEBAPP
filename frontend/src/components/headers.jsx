import LogoWrap from "../utilities/logoWrap";
import oasisLogo from "../assets/oasisLogo.png";
import NavItem from "./navItem";
import HoverLift from "./hoverLift";
import { useState, useEffect } from "react";
import { CircleUserRound, Bell, BellDot, LayoutDashboard, ChevronLeft, Cog, FileText, Upload, Users, LogOut } from "lucide-react";
import Notifications from "../utilities/notifications";
import { UserRound, BellIcon } from "lucide-react";
import api from "../api/axios";
import Subtitle from "../utilities/subtitle";
import UserDropdownSettings from "../utilities/userDropdownSettings";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth.service";
import { ConfirmModal } from "./popupModal";

const API_BASE = api.defaults.baseURL;

export function Header({ admin = false }) {
    const [bell, setBell] = useState('');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [open, setOpen] = useState(false);

    const [animationClass, setAnimationClass] = useState("");
    const [openSettings, setOpenSettings] = useState(false);

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


    if (!admin && (!user || !profile)) return null;

    return (
        <>
        {admin ? 
            <header className="sticky top-0 w-full h-5 flex flex-row justify-between
            items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-50">
                <LogoWrap />
                <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto"/>
                <Subtitle text={"Admin"} color={"text-[#3E8679]"} size={"text-[1rem]"}/> 
            </header>
            : 
            <header className="sticky top-0 w-full h-5 flex flex-row justify-between
            items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-50">
                {/* VINCENT */}
                <LogoWrap />
                <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto"/>
                
                <div className="flex gap-3 items-center">
                    <HoverLift>
                        {!admin && (
                            <a
                            href="#prospectForm"
                            className="font-oasis-text text-oasis-button-dark cursor-pointer"
                            >
                            Submit MOA Prospect
                            </a>
                        )}
                    </HoverLift>

                    <HoverLift onClick={handleNotifClick}>
                        {!admin && (
                            <div>
                            <Bell size={28} color="#54A194" />
                            </div>
                        )}
                    </HoverLift>

                    <HoverLift onClick={handleSettingsClick}>
                    {!admin && (
                        hasProfile ? (
                            <img
                            className="w-8 rounded-full object-cover aspect-square"
                            src={profile.photo_url}
                            alt="Profile"
                            />
                        ) : (
                            <CircleUserRound color="#54A194" size={28}/>
                        )
                    )}
                    </HoverLift>

                </div>
            </header>
        }
            {openSettings && <UserDropdownSettings
                    open={openSettings}
                    className={animationClass}
                    items={[
                        { text: "Profile", to: "/student-profile" },
                        { text: "Settings", to: "/settings" },
                        { text: "Log out" },
                    ]}
                />}
            {open && <Notifications open={open} />}
        </>
    )
}

export function AdminNavigation({ isOpen, setIsOpen}) {
    
    const [time, setTime] = useState('');
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/access")
    }

    // Time update
    useEffect(() => {
        const updateTime = () => {
            setTime(
                new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {confirmation && 
                <ConfirmModal confText="logout?" onLogOut={handleLogout} onCancel={() => setConfirmation(false)}/>
            }
            <div className={`fixed left-0 top-0 z-100 h-screen p-3 bg-white grid grid-cols-1 place-items-start shadow-[0px_0px_10px_rgba(0,0,0,0.5)] transition-all duration-150 ease-in-out overflow-hidden ${isOpen ? "lg:w-[260px]":"lg:w-[70px]"} w-[260px]`}>

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
                        isTrigger={true} 
                        isOpen={isOpen} 
                        label={"Logout"} 
                        iconLeft={<LogOut color="#2B6259" 
                        onClick={() => setConfirmation(true)}/>}
                    />

                    
                </div>

            </div>
        </>
    )
}


export function StudentHeader() {

    const [scrolled, setScrolled] = useState(false);

    //Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`
                fixed top-0 left-0 w-full z-110 translate-y-15
                transition-all duration-300 
                ${scrolled ? 'backdrop-blur-md bg-white/30 shadow-lg translate-y-[-15]' : 'bg-white drop-shadow-[0px_10px_5px_rgba(0,0,0,0.3)]'}
                flex flex-row justify-between items-center px-5 py-3 z-100
            `}
        >
                {/* VINCENT */}
                <ul className="w-full p-3 flex flex-row justify-center items-center gap-15">
                    <NavItem to="/home" label="Home" isOpen={true}/>
                    <NavItem to="/htedirectory" label="HTE Directory" isOpen={true}/>
                    <NavItem to="/ojthub" label="OJT Hub" isOpen={true}/>
                    <NavItem to="/announcements" label="Announcement" isOpen={true}/>
                </ul>
            

        </div>
    );
}



export function AdminHeader() {
    const [time, setTime] = useState('');
    const [scrolled, setScrolled] = useState(false);

    const [animationClass, setAnimationClass] = useState("");
    const [openSettings, setOpenSettings] = useState(false);

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
    // Time update
    useEffect(() => {
        const updateTime = () => {
            setTime(
                new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    return (
        <div
            className={`
                fixed top-0 left-0 w-full z-50 translate-y-15
                transition-all duration-300
                ${scrolled ? 'backdrop-blur-md bg-white/30 shadow-lg translate-y-[-15]' : 'bg-transparent'}
                flex flex-row justify-between items-center px-5 py-3
            `}
        >
            {/* Time + Clock */}
            <div className="bg-admin-header-bg p-3 rounded-4xl min-w-28 flex flex-wrap flex-row justify-center items-center gap-3">
                <p className="animate__animated animate__fadeInUp ease-in">{time}</p>
                <img src={clock} className="w-[1.2rem]" />
            </div>

            {/* Navigation */}
            <div className="bg-admin-header-bg p-1 rounded-4xl w-fit min-h-14 max-h-14 flex flex-row justify-between items-center">
                <ul className="w-full p-3 flex flex-row justify-center items-center gap-15">
                    {/* VINCENT */}
                    <NavItem to="/admin" label="Dashboard" />
                    <NavItem to="/admoperations" label="Operations" />
                    <NavItem to="/admMoaOverview" label="MOA Overview" />
                    <NavItem to="/admUploads" label="Document Upload" />
                    <NavItem to="/admStudents" label="Students" />
                </ul>
            </div>

            {/* Icons */}
            <div className="bg-admin-header-bg p-3 rounded-4xl w-fit flex flex-row justify-between items-center gap-5">
                <HoverLift>
                    <BellIcon/>
                </HoverLift>
                
                <HoverLift>
                    <UserRound onClick={handleSettingsClick}/>
                </HoverLift>
            </div>
            {openSettings && 
                <UserDropdownSettings
                    open={openSettings}
                    className={animationClass}
                    items={[
                        { text: "Profile", to: "/admin-profile" },
                        { text: "Settings", to: "/admSettings" },
                        { text: "Sign out" },
                    ]}
                />
            }
        </div>
    );
}