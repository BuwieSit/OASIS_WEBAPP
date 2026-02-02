import { CircleX, User } from "lucide-react";
import { useState, useEffect } from "react";
import NavItem from "../components/navItem";
import Subtitle from "./subtitle";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth.service";

export default function UserDropdownSettings({ open, className, items }) {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [animationClass, setAnimationClass] = useState("");

    useEffect(() => {
        if (open) {
            setShow(true)
            setAnimationClass("bubble-pop");
        } else {
            setAnimationClass("bubble-close");
            setShow(false);
        }
    }, [open])

    if (!show) return null;

    const handleLogout = () => {
        logoutUser();
        navigate("/access")
    }
    const defaultItems = [
        { text: "Profile", to: "/student-profile" },
        { text: "Settings", to: "/settings" },
        { text: "Log out", onClick: handleLogout },
    ];

    const setItems = (items ?? defaultItems).map(item =>
        ["Log out", "Sign out"].includes(item.text) && !item.onClick
            ? { ...item, onClick: handleLogout }
            : item
    );

    return (
        <>
            <div className={`w-50 p-5 fixed top-[10%] right-0 -translate-x-[10%] bg-[rgba(255,255,255,0.5)] backdrop-blur-2xl z-150 rounded-3xl shadow-[0px_0px_5px_rgba(0,0,0,0.5)] ${animationClass} ${className}`}>
                <ul>
                    {setItems.map((item, index) => (
                        <SetItem
                            key={index}
                            text={item.text}
                            to={item.to}
                            onClick={item.onClick}
                        />
                    ))}
                </ul>
            </div>
        </>
    )
}


export function SetItem({ text, to, onClick }) {
  const content = (
    <li
      onClick={onClick}
      className="flex gap-3 p-3 rounded-2xl font-oasis-text text-[0.9rem]
                 cursor-pointer group hover:bg-admin-header-bg
                 relative transition duration-100 ease-in-out"
    >
      <p className="w-full h-full">{text}</p>
    </li>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}