import BaseModal from "./BaseModal";
import { User, ShieldCheck, MailQuestionMark, ArrowUpRight } from "lucide-react";

export function SetupProfileModal({ visible, onGoToProfile }) {
    return (
        <BaseModal 
            visible={visible} 
            onClose={() => {}} // Disabled close for setup profile
            showCloseButton={false}
            className="items-center text-center"
        >
            {/* ICON / VISUAL */}
            <div className="w-20 h-20 bg-oasis-blue/20 rounded-full flex items-center justify-center mb-6 text-oasis-header">
                <User size={40} />
            </div>

            <h2 className="text-2xl font-black text-gray-800 font-oasis-text mb-2 leading-tight">
                Complete Your Profile!
            </h2>
            
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
                Welcome to OASIS! To get started, please set your <span className="font-bold text-oasis-header">First Name, Middle Initial, and Last Name</span> in your profile settings. This is required for official document generation.
            </p>

            <div className="w-full flex flex-col gap-3">
                <button 
                    onClick={onGoToProfile}
                    className="w-full py-4 bg-oasis-header text-white rounded-2xl font-bold text-lg hover:bg-oasis-button-dark transition-all shadow-xl shadow-oasis-header/20 active:scale-95 flex items-center justify-center gap-2 group"
                >
                    Go to Profile Settings
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-gray-400">
                <ShieldCheck size={16} />
                <span className="text-[0.65rem] font-black uppercase tracking-widest">Secured Student Portal</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-gray-400">
                <MailQuestionMark size={16} />
                <span className="text-[0.5rem] font-black uppercase tracking-widest">For questions: oasiskomunidevs@gmail.com</span>
            </div>
        </BaseModal>
    );
}
