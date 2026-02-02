import { useState } from "react";

export default function Accordion({ headerText, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full bg-oasis-blue rounded-2xl overflow-hidden transition-all cursor-pointer">
            
            {/* HEADER */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-start items-center gap-5 p-4 font-oasis-text text-black text-left hover:bg-oasis-aqua transition">
                    <span className={`transform transition-transform duration-300 text-oasis-button-dark ${ open ? "rotate-90" : ""}`}>▶</span>
                    <span className="text-oasis-button-dark font-bold">{headerText}</span>
            </button>

            {/* CONTENT */}
            <div
                className={`grid transition-all duration-300  ${
                    open ? "grid-rows-[1fr] p-4 ease-in-out " : "grid-rows-[0fr]"
                }`}
            >
                <div className="overflow-hidden text-white text-[0.8rem] ">
                    {children}
                </div>
            </div>
        </div>
    );
}
