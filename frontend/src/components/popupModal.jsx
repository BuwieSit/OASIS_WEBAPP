import { useEffect, useState } from "react";
import { CheckIcon } from "../utilities/animatedIcons";

export function ConfirmModal({ time = 2000, onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose?.(); 
        }, time);

        return () => clearTimeout(timer);
    }, [time, onClose]);

    if (!visible) return null;

    return (
        <div className="z-120 fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center">
            <div className="w-100 h-50 p-5 bg-white rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-700 transition ease-in-out">
                <CheckIcon />
                <p>Done</p>
            </div>
        </div>
    );
}
