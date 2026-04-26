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
    onClick
}) {
    const [isHovered, setIsHovered] = useState(false);

    const activeStyles = "bg-oasis-aqua/10 text-oasis-aqua";
    const inactiveStyles = "text-oasis-header hover:bg-gray-50";

    const content = (isActive) => (
        <div
            className={`
                relative flex items-center w-full p-2 rounded-xl transition-all duration-200 group
                ${isOpen ? "justify-start gap-3" : "justify-center"}
                ${isActive ? activeStyles : inactiveStyles}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* TOOLTIP FOR CLOSED STATE */}
            {!isOpen && isHovered && (
                <div className="absolute left-full ml-4 px-3 py-1 bg-oasis-dark text-white text-xs font-bold rounded-md whitespace-nowrap z-[300] shadow-xl animate__animated animate__fadeIn animate__faster pointer-events-none">
                    {label}
                    {/* Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-oasis-dark rotate-45" />
                </div>
            )}

            {/* LEFT ICON */}
            {iconLeft &&
                React.cloneElement(iconLeft, {
                    size: 22,
                    className: `
                        transition-all duration-200 shrink-0
                        ${isActive ? "text-oasis-aqua scale-110" : "text-black group-hover:text-oasis-header"}
                    `,
                })}

            {/* LABEL */}
            <span
                className={`
                    font-oasis-text font-bold transition-all duration-200 whitespace-nowrap
                    ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                `}
            >
                {label}
            </span>

            {/* RIGHT ICON */}
            {isOpen && iconRight &&
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
        <li className="w-full list-none">
            <HoverLift onClick={onClick} className="w-full">
                {isNotLink ? (
                    content(false)
                ) : (
                    <NavLink to={to} className="w-full block">
                        {({ isActive }) => content(isActive)}
                    </NavLink>
                )}
            </HoverLift>
        </li>
    );
}
