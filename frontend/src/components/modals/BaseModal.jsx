import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * BaseModal - A reusable wrapper for all full-screen modals.
 * Handles backdrop, centering, closing logic, and scroll locking.
 */
const BaseModal = ({ 
    children, 
    visible, 
    onClose, 
    title, 
    className = "", 
    showCloseButton = true,
    maxWidth = "max-w-md",
    padding = "p-8",
    animate = "animate__zoomIn"
}) => {
    useEffect(() => {
        if (typeof document === "undefined") return;
        
        if (visible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [visible]);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!visible) return null;

    return (
        <div 
            className="fixed inset-0 z-200 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate__animated animate__fadeIn animate__faster"
            onClick={onClose}
        >
            <div 
                className={`
                    bg-white w-full ${maxWidth} rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col 
                    relative animate__animated ${animate} animate__faster ${padding} ${className}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 z-10 p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                )}

                {title && (
                    <h2 className="text-2xl font-black text-gray-800 font-oasis-text mb-4 leading-tight text-center">
                        {title}
                    </h2>
                )}

                {children}
            </div>
        </div>
    );
};

export default BaseModal;
