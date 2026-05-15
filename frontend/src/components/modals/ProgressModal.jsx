import BaseModal from "./BaseModal";
import { X, ShieldCheck } from "lucide-react";

export function ProgressModal({ progress = 0, visible, onCancel, title = "Processing..." }) {
    return (
        <BaseModal 
            visible={visible} 
            onClose={onCancel} 
            showCloseButton={false}
            className="items-center text-center"
        >
            {/* PROGRESS RING/ICON */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * progress) / 100}
                        className="text-oasis-header transition-all duration-300 ease-out"
                    />
                </svg>
                <span className="absolute text-xl font-black text-oasis-header font-oasis-text">
                    {Math.round(progress)}%
                </span>
            </div>

            <h2 className="text-xl font-black text-gray-800 font-oasis-text mb-2 leading-tight">
                {title}
            </h2>
            
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-8">
                Please wait while we process your request. Do not close this window for better results.
            </p>

            <div className="w-full">
                <button 
                    onClick={onCancel}
                    className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 group"
                >
                    <X size={18} />
                    Cancel Process
                </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-gray-300">
                <ShieldCheck size={14} />
                <span className="text-[0.55rem] font-black uppercase tracking-widest">System Processing</span>
            </div>
        </BaseModal>
    );
}
