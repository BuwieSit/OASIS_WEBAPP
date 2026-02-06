import { NavLink } from "react-router-dom";
import HoverLift from "./hoverLift";

export default function NavItem({ to, label, iconLeft, iconRight }) {
    return (
        <li>
            <HoverLift>
                <div className="flex flex-row justify-between items-center gap-2 w-full">
                {iconLeft}
                <NavLink
                    to={to}
                    className={({ isActive }) =>
                        `font-oasis-text transition-all duration-200 font-bold ${
                            isActive ? "scale-110 -translate-y-1 text-oasis-aqua underline underline-offset-4" : ""
                        }`
                    }
                >
                    {label}
                </NavLink>
                {iconRight}
                </div>

            </HoverLift>
        </li>
    );
}
