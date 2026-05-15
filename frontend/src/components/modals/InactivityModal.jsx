import BaseModal from "./BaseModal";
import { ShieldCheck } from "lucide-react";

export function InactivityModal({ onStayActive, onLogout, visible = true }) {
    return (
        <BaseModal 
            visible={visible} 
            onClose={onStayActive}
            showCloseButton={false}
            className="items-center text-center p-10"
        >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 animate-pulse">
                <ShieldCheck size={40} />
            </div>

            <h2 className="text-2xl font-black text-gray-800 font-oasis-text mb-2 leading-tight">
                Inactivity Warning
            </h2>
            
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 italic">
                You have been inactive for quite some time. For security reasons, you will be automatically logged out after <span className="font-bold text-red-500">15 minutes</span> of inactivity.
            </p>

            <div className="w-full flex flex-col gap-3">
                <button 
                    onClick={onStayActive}
                    className="w-full py-4 bg-oasis-header text-white rounded-2xl font-bold text-lg hover:bg-oasis-button-dark transition-all shadow-xl shadow-oasis-header/20 active:scale-95"
                >
                    Confirm or I'm Active
                </button>
                <button 
                    onClick={onLogout}
                    className="w-full py-3 text-gray-400 font-bold hover:text-red-500 transition-all text-sm"
                >
                    Logout Now
                </button>
            </div>

            <p className="mt-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                OASIS Session Security
            </p>
        </BaseModal>
    );
}
