import LogoWrap from "../utilities/logoWrap"
import oasisLogo from "../assets/oasisLogo.png"
import { Link } from "react-router-dom"
import NavItem from "./navItem"
import HoverLift from "./hoverLift"
import clock from "../assets/icons/clock.png"
import { useState, useEffect } from "react"
import { CircleUserRound, Bell, BellDot } from "lucide-react";
import Notifications from "../utilities/notifications"
import { Settings, UserRound } from "lucide-react"
export function Header({ admin = false }) {
    const [bell, setBell] = useState('');
    const [open, setOpen] = useState(false);

    const handleClick = () => {

        requestAnimationFrame(() => setAnimate(true));
        setOpen(prev => !prev);
    }

    return (
        <>
            <header className="sticky top-0 w-full h-5 flex flex-row justify-between
            items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 pl-5 pr-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-50">
                {/* VINCENT */}
                <Link to="/"><LogoWrap /></Link>
                <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto hover:cursor-pointer"></img>
                
                <div className="flex gap-3 items-center">
                    <HoverLift>
                        {admin ? "" : <a href="#prospectForm" className="font-oasis-text text-oasis-button-dark cursor-pointer ">Submit MOA Prospect</a>}
                    </HoverLift>

                    <HoverLift>
                        {admin ? "" : <div onClick={handleClick}><Bell size={28} color="#54A194"/></div>}
                    </HoverLift>

                    <HoverLift>                        
                        {admin ? "" : <Link to="/student-profile"><CircleUserRound color="#54A194" size={28}/></Link>}
                    </HoverLift>
                </div>
            </header>
            {open && <Notifications open={open}/>}
            
        </>
    )
}


export function AdminHeader() {
    const [time, setTime] = useState('');
    const [scrolled, setScrolled] = useState(false);

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
                    <Settings/>
                </HoverLift>

                <HoverLift>
                    <Link to={"/admin-profile"}><UserRound/></Link>
                </HoverLift>
            </div>
        </div>
    );
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
                    <NavItem to="/home" label="Home" />
                    <NavItem to="/htedirectory" label="HTE Directory" />
                    <NavItem to="/ojthub" label="OJT Hub" />
                    <NavItem to="/announcements" label="Announcement" />
                </ul>
            

        </div>
    );
}

