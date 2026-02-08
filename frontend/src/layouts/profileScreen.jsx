
import { AdminNavigation, Header, StudentHeader } from "../components/headers";
import { useState } from "react";

export function StudentProfileScreen({ children }) {
    return(
        <>
            <Header/>
            <StudentHeader/>
            <div className="w-full h-auto min-h-dvh flex flex-col items-center overflow-x-hidden p-10 bg-linear-to-l from-white via-oasis-blue to-white pt-30">
                {children}
            </div>
        </>
    )
}

export function AdminProfileScreen({ children, className, }) {
    const [isOpen, setIsOpen] = useState(false)
    return(
        <>
        <div className="relative w-full min-h-screen flex bg-[#F4FCF8] overflow-x-hidden">
            
            <AdminNavigation isOpen={isOpen} setIsOpen={setIsOpen} />
            {isOpen && (
            <div
                className="fixed inset-0 bg-black/40 z-95 "
                onClick={() => setIsOpen(false)}
            />
            )}
            <div
                className={`
                    flex-1 flex flex-col items-center gap-10 pb-5
                    bg-[url("../assets/ctaBg.png")] bg-blend-multiply bg-center bg-no-repeat bg-cover
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "lg:ml-[260px]" : "lg:ml-[70px]"}
                `}
            >
                <Header admin={true}/>
                <div className={`w-full h-auto min-h-dvh flex flex-col overflow-x-hidden p-10 bg-linear-to-l from-white via-oasis-blue to-white pt-30 ${className}`}>
                    {children}
                </div>
            </div>
            
        </div>
            
        </>
    )
}


