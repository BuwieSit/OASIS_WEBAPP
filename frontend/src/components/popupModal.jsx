import { useEffect, useState } from "react";
import { Check, X, ShieldCheck } from "lucide-react";


export * from "./modals";

export function GeneralPopupModal({ 
    time = 3000, 
    onClose, 
    text, 
    title,
    icon,
    isSuccess,
    isFailed,
    isNeutral = true
}) {
    const [visible, setVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const exitDuration = 500; 

    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, time - exitDuration);

        const removeTimer = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, time);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [time, onClose]);

    if (!visible) return null;

    // Default icons if none provided
    const defaultIcon = isSuccess ? <Check size={28}/> : (isFailed ? <X size={28}/> : <ShieldCheck size={28}/>);
    const finalIcon = icon || defaultIcon;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-300 w-full max-w-sm px-4 pointer-events-none">
            <div 
                className={`
                    animate__animated animate__faster 
                    ${isExiting ? "animate__fadeOutUp" : "animate__fadeInDown"}
                    w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                    rounded-2xl flex flex-col overflow-hidden pointer-events-auto
                `}
            >
                <div className="p-4 flex items-center gap-4">
                    <div className={`
                        p-2.5 rounded-xl shrink-0
                        ${isSuccess ? "bg-green-100 text-green-600" : ""}
                        ${isFailed ? "bg-red-100 text-red-600" : ""}
                        ${isNeutral ? "bg-oasis-aqua/10 text-oasis-aqua" : ""}
                    `}>
                        {finalIcon}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                        <h4 className="font-oasis-text font-bold text-oasis-header text-sm truncate">
                            {title}
                        </h4>
                        <p className="font-oasis-text text-gray-500 text-xs leading-relaxed">
                            {text}
                        </p>
                    </div>

                    <button 
                        onClick={() => setIsExiting(true)}
                        className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-100/50">
                    <div 
                        className={`
                            h-full transition-all ease-linear
                            ${isSuccess ? "bg-green-500" : ""}
                            ${isFailed ? "bg-red-500" : ""}
                            ${isNeutral ? "bg-oasis-aqua" : ""}
                        `}
                        style={{ 
                            width: isExiting ? "0%" : "100%",
                            transitionDuration: `${time}ms`
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
