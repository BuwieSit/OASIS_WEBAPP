import { ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Accordion({ headerText, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`
            w-full overflow-hidden transition-all duration-500
            ${open 
                ? "bg-white rounded-[2rem] shadow-xl shadow-oasis-blue/5 border border-oasis-blue/20" 
                : "bg-white/40 hover:bg-white rounded-2xl border border-gray-100 hover:shadow-md"}
        `}>
            
            {/* HEADER */}
            <button
                onClick={() => setOpen(!open)}
                className={`
                    group w-full flex justify-between items-center px-6 py-5 
                    font-oasis-text text-left transition-all duration-300
                    ${open ? "bg-oasis-header/5" : ""}
                `}
            >
                <div className="flex items-center gap-4">
                    <div className={`
                        p-2 rounded-xl transition-all duration-500
                        ${open ? "bg-oasis-header text-white rotate-90" : "bg-oasis-header/10 text-oasis-header"}
                    `}>
                        <ChevronRight size={20} />
                    </div>
                    <span className={`
                        font-bold text-[1.1rem] transition-colors duration-300
                        ${open ? "text-oasis-header" : "text-gray-700 group-hover:text-oasis-header"}
                    `}>
                        {headerText}
                    </span>
                </div>
                
                <div className={`
                    hidden sm:block text-[0.65rem] font-bold uppercase tracking-[0.2em] transition-all duration-300
                    ${open ? "text-oasis-header/40" : "text-gray-300 opacity-0 group-hover:opacity-100"}
                `}>
                    {open ? "Collapse" : "Expand"}
                </div>
            </button>

            {/* CONTENT */}
            <div
                className={`
                    grid transition-all duration-500 ease-in-out
                    ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                `}
            >
                <div className="overflow-hidden">
                    <div className="px-6 py-6 md:px-10 border-t border-oasis-blue/5 bg-white">
                        <div className="animate__animated animate__fadeIn animate__faster">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
