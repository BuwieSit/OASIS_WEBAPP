
// import { NavLink } from "react-router-dom";
// import HoverLift from "./hoverLift";

// export default function NavItem({ to, label, iconLeft, iconRight, isOpen, isTrigger, onClick }) {
//     return (
//         <li>
//             <HoverLift>
//                 <div
//                     className={`
//                         flex items-center w-full
//                         ${isOpen ? "justify-between gap-2" : "justify-center"}
//                     `}
//                     onClick={onClick}
//                 >
//                     {/* LEFT ICON */}
//                     {iconLeft}

//                     {/* LABEL */}
//                     <NavLink
//                         to={to}
//                         className={({ isActive }) =>
//                             `
//                             font-oasis-text font-bold transition-all duration-200
//                             ${isTrigger ? "" : `${isActive ? "scale-110 -translate-y-1 text-oasis-aqua underline underline-offset-4" : ""}`}
                            
//                             ${isOpen ? "opacity-100 ml-1" : "opacity-0 w-0 overflow-hidden"}
//                             `
//                         }
//                     >
//                         {label}
//                     </NavLink>

//                     {/* RIGHT ICON */}
//                     {isOpen && iconRight}
//                 </div>
//             </HoverLift>
//         </li>
//     );
// }


import { NavLink } from "react-router-dom";
import HoverLift from "./hoverLift";
import React from "react";

export default function NavItem({
    to,
    label,
    iconLeft,
    iconRight,
    isOpen,
    isTrigger,
    onClick
}) {
    return (
        <li>
            <HoverLift>
                {isTrigger ? (
                    //TRIGGER ITEM (no active state)
                     <NavLink to={to} className="w-full">
  
                        <div
                            className={`
                                flex items-center w-full cursor-pointer
                                ${isOpen ? "justify-between gap-2" : "justify-center"}
                            `}
                            onClick={onClick}
                        >
                            {iconLeft}
                                
                            <span
                                className={`
                                    font-oasis-text text-oasis-header font-bold transition-all duration-200
                                    ${isOpen ? "opacity-100 ml-1" : "opacity-0 w-0 overflow-hidden"}
                                `}
                                onClick={onClick}
                            >
                                {label}
                            </span>

                            {isOpen && iconRight}
                        </div>
                     </NavLink>
                ) : (
                    // ROUTE ITEM
                    <NavLink to={to} className="w-full">
                        {({ isActive }) => (
                            <div
                                className={`
                                    flex items-center w-full transition-all duration-200
                                    ${isOpen ? "justify-between gap-2" : "justify-center"}
                                    ${isActive ? "text-oasis-aqua " : "text-oasis-header"}
                                `}
                            >
                                {/* LEFT ICON */}
                                {iconLeft &&
                                    React.cloneElement(iconLeft, {
                                        className: `
                                            transition-colors duration-200 
                                            ${isActive ? "text-oasis-aqua" : "text-black"}
                                        `,
                                    })}

                                {/* LABEL */}
                                <span
                                    className={`
                                        font-oasis-text font-bold transition-all duration-200
                                        ${isActive ? "scale-110 -translate-y-1 underline underline-offset-4 " : ""}
                                        ${isOpen ? "opacity-100 ml-1" : "opacity-0 w-0 overflow-hidden"}
                                    `}
                                >
                                    {label}
                                </span>

                                {/* RIGHT ICON */}
                                {isOpen &&
                                    iconRight &&
                                    React.cloneElement(iconRight, {
                                        className: `
                                            transition-colors duration-200
                                            ${isActive ? "text-oasis-aqua" : "text-black"}
                                        `,
                                    })}
                            </div>
                        )}
                    </NavLink>
                )}
            </HoverLift>
        </li>
    );
}
