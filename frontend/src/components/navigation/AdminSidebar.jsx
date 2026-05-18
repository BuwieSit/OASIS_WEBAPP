import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { ConfirmModal } from "../popupModal";
import NavItem from "../navItem";
import oasisLogo from "../../assets/oasisLogo.png";
import { 
    LayoutDashboard, 
    Cog, 
    Upload, 
    Users, 
    BellIcon, 
    LogOut, 
    ChevronLeft 
} from "lucide-react";

export default function AdminSidebar({ isOpen, setIsOpen }) {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/access");
    };

    return (
        <>
            {confirmation && 
                <ConfirmModal confText="logout?" onLogOut={handleLogout} onCancel={() => setConfirmation(false)}/>
            }
            <div className={`fixed left-0 top-0 z-100 h-screen p-4 bg-white flex flex-col items-start shadow-[0px_0px_20px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out ${isOpen ? "sm:w-[200px] md:w-[220px] lg:w-[280px]":"sm:w-[70px] md:w-[75px] lg:w-[85px]"} w-[280px]`}>

                {/* LOGO & TOGGLE */}
                <div className={`w-full flex items-center mb-10 ${isOpen ? "justify-between" : "justify-center"}`}>
                    {isOpen && <img src={oasisLogo} className="w-32 object-contain animate__animated animate__fadeIn" alt="Oasis Logo"/>}
                    <div 
                        className="cursor-pointer rounded-xl p-2 transition-all duration-200 ease-in-out flex justify-center items-center hover:bg-oasis-aqua/10 text-oasis-header" 
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <ChevronLeft size={24} className={`transition-transform duration-500 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`} />  
                    </div>
                </div>

                {/* MAIN NAV */}
                <ul className="w-full flex flex-col justify-start items-start gap-2 list-none p-0 flex-1">
                    <NavItem 
                        to="/admin" 
                        label="Dashboard" 
                        iconLeft={<LayoutDashboard />} 
                        isOpen={isOpen} 
                    />
                    <NavItem 
                        to="/admHteManagement" 
                        label="HTE Management" 
                        iconLeft={<Cog />} 
                        isOpen={isOpen} 
                    />
                    <NavItem 
                        to="/admUploads" 
                        label="Document Upload" 
                        iconLeft={<Upload />} 
                        isOpen={isOpen} 
                    />
                    <NavItem 
                        to="/admStudents" 
                        label="Students" 
                        iconLeft={<Users />} 
                        isOpen={isOpen} 
                    />
                </ul>

                {/* BOTTOM ACTIONS */}
                <div className="w-full flex flex-col justify-end items-start gap-2 list-none p-0 pt-6 border-t border-gray-100">
                    <NavItem 
                        to="/admNotifications"
                        isOpen={isOpen} 
                        label={"Notifications"} 
                        iconLeft={<BellIcon />}
                    />
                    
                    <NavItem 
                        isNotLink={true}
                        isOpen={isOpen} 
                        label={"Logout"} 
                        iconLeft={<LogOut />}
                        onClick={() => setConfirmation(true)}
                    />
                </div>
            </div>
        </>
    );
}
