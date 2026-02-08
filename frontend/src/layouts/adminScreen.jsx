// import { AdminNavigation, Header } from '../components/headers'
// import Footer from '../components/footer'
// export default function AdminScreen({ children }) {
//     return(
//         <>
//             <div className={`w-full h-full sm:pl-12 md:pl-13 lg:pl-15  pb-5 bg-[url("../assets/ctaBg.png")] bg-[#F4FCF8] bg-blend-multiply bg-center bg-no-repeat bg-cover flex flex-col justify-center items-center gap-10 overflow-x-hidden overflow-y-auto`}>
//                 <div className="absolute inset-0 bg-[url('../assets/ctaBg.png')] bg-center bg-cover opacity-10 pointer-events-none"
//                 />
//                 <Header admin={true}/> 
//                 <AdminNavigation/>
//                 {children}
//                 <Footer />
//             </div>
//         </>
//     )
// }

import { useState } from "react"
import { AdminNavigation, Header } from '../components/headers'
import Footer from '../components/footer'

export default function AdminScreen({ children }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative w-full min-h-screen flex bg-[#F4FCF8] overflow-x-hidden">

            {/* SIDEBAR */}
            <AdminNavigation isOpen={isOpen} setIsOpen={setIsOpen} />
            {isOpen && (
            <div
                className="fixed inset-0 bg-black/40 z-95 "
                onClick={() => setIsOpen(false)}
            />
            )}

            {/* MAIN CONTENT WRAPPER */}
            <div
                className={`
                    flex-1 flex flex-col items-center gap-10 pb-5
                    bg-[url("../assets/ctaBg.png")] bg-blend-multiply bg-center bg-no-repeat bg-cover
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "lg:ml-[260px]" : "lg:ml-[70px]"}
                `}
            >
                <div className="absolute inset-0 bg-[url('../assets/ctaBg.png')] bg-center bg-cover opacity-10 pointer-events-none" />

                <Header admin />

                {children}

                <Footer />
            </div>
        </div>
    )
}
