import { NavLink } from "react-router-dom";
import HoverLift from "./hoverLift";
import React, { useState } from "react";

export default function NavItem({
    to,
    label,
    iconLeft,
    iconRight,
    isOpen,
    isTrigger,
    isNotLink,
    onClick,
    variant = "sidebar" // "sidebar" or "header"
}) {
    const [isHovered, setIsHovered] = useState(false);

    const isSidebar = variant === "sidebar";

    const sidebarActive = "bg-oasis-aqua/10 text-oasis-aqua";
    const sidebarInactive = "text-oasis-header hover:bg-gray-50";
    
    const headerActive = "text-oasis-aqua";
    const headerInactive = "text-oasis-header hover:text-oasis-aqua";

    const content = (isActive) => (
        <div
            className={`
                relative flex items-center transition-all duration-200 group
                ${isSidebar ? "w-full p-2 rounded-xl" : "px-2 py-1 flex-col"}
                ${isSidebar && isOpen ? "justify-start gap-3" : "justify-center"}
                ${!isSidebar ? "items-center text-center min-w-[80px]" : ""}
                ${isSidebar 
                    ? (isActive ? sidebarActive : sidebarInactive) 
                    : (isActive ? headerActive : headerInactive)}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* TOOLTIP FOR CLOSED SIDEBAR */}
            {isSidebar && !isOpen && isHovered && (
                <div className="absolute left-full ml-4 px-3 py-1 bg-oasis-dark text-white text-xs font-bold rounded-md whitespace-nowrap z-[300] shadow-xl animate__animated animate__fadeIn animate__faster pointer-events-none">
                    {label}
                    {/* Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-oasis-dark rotate-45" />
                </div>
            )}

            {/* LEFT ICON */}
            {iconLeft &&
                React.cloneElement(iconLeft, {
                    size: isSidebar ? 22 : 20,
                    className: `
                        transition-all duration-200 shrink-0
                        ${isActive ? "text-oasis-aqua scale-110" : "text-black group-hover:text-oasis-header"}
                    `,
                })}

            {/* LABEL */}
            <span
                className={`
                    font-oasis-text font-bold transition-all duration-200 whitespace-nowrap text-center
                    ${isSidebar && !isOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
                `}
            >
                {label}
            </span>

            {/* ACTIVE INDICATOR FOR HEADER */}
            {!isSidebar && isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-0.5 bg-oasis-aqua rounded-full animate__animated animate__fadeIn animate__faster" />
            )}

            {/* RIGHT ICON */}
            {isSidebar && isOpen && iconRight &&
                React.cloneElement(iconRight, {
                    size: 18,
                    className: `
                        ml-auto transition-colors duration-200
                        ${isActive ? "text-oasis-aqua" : "text-black"}
                    `,
                })}
        </div>
    );

    return (
        <li className={`${isSidebar ? "w-full" : ""} list-none`}>
            <HoverLift onClick={onClick} className={isSidebar ? "w-full" : ""}>
                {isNotLink ? (
                    content(false)
                ) : (
                    <NavLink to={to} className={`${isSidebar ? "w-full" : ""} block`}>
                        {({ isActive }) => content(isActive)}
                    </NavLink>
                )}
            </HoverLift>
        </li>
    );
}
