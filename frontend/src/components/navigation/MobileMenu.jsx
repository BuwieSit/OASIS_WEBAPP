import NavItem from "../navItem";
import Subtitle from "../../utilities/subtitle";

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
