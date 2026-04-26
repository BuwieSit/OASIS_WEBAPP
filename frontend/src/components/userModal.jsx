import { X } from "lucide-react";
import pupImage from "../assets/pupImage.jpg";

export default function UserModal({ children }) { 
    return (
        <>
            <div className={`w-[40%] h-full p-1 bg-white absolute right-0 top-[50%] right translate-y-[-50%] shadow-[inset_0px_0px_100px] shadow-oasis-blue drop-shadow-[10px_10px_5px_rgba(0,0,0,0.3)] duration-500 ease-in-out flex items-center justify-center`}>
                <div className='relative min-w-100 max-w-130 aspect-square p-10 flex flex-col items-center justify-evenly'>
                    {children}
                </div>
            </div>
        </>
    )
}

export function AnnouncementModal({ visible, onClose, title, content, date, time }) {
    if (!visible) return null;

    return (
        <div className="
            fixed inset-0
            z-150
            bg-black/60
            backdrop-blur-sm
            flex items-center justify-center
            p-4
            animate-fadeIn
        ">
            {/* Modal Container */}
            <div className="
                relative
                w-full
                max-w-2xl
                max-h-[85vh]
                bg-white
                rounded-[2rem]
                shadow-2xl
                overflow-hidden
                flex flex-col
                border border-white
                animate__animated animate__zoomIn animate__faster
            ">
                {/* CLOSE BUTTON */}
                <button 
                    onClick={onClose}
                    className="
                        absolute
                        top-4
                        right-4
                        z-50
                        w-10 h-10
                        bg-white/20
                        hover:bg-white/40
                        backdrop-blur-md
                        text-white
                        rounded-full
                        flex items-center justify-center
                        transition-all
                        hover:rotate-90
                        active:scale-90
                        cursor-pointer
                        border border-white/30
                    "
                >
                    <X size={24} />
                </button>

                {/* HEADER */}
                <section className="
                    relative
                    w-full
                    pt-10 pb-6 px-8
                    bg-gradient-to-br
                    from-oasis-header
                    to-[#1e453f]
                    flex flex-col
                    items-center
                    text-center
                    overflow-hidden
                ">
                    <img 
                        src={pupImage} 
                        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-10 pointer-events-none object-cover transition-transform group-hover:scale-110' 
                        alt=""
                    />
                    
                    <div className="relative z-10 flex flex-col gap-2 p-3 w-full">
                        <h2 className="font-oasis-text font-bold text-lg sm:text-xl lg:text-2xl text-white leading-tight break-words w-full">
                            {title}
                        </h2>

                        {date && (
                            <div className="flex items-center justify-center gap-2 text-white/70">
                                <span className="h-px w-8 bg-white/30"></span>
                                <p className="font-oasis-text italic text-xs sm:text-sm">
                                    {date} {time ? `• ${time}` : ""}
                                </p>
                                <span className="h-px w-8 bg-white/30"></span>
                            </div>
                        )}
                    </div>
                </section>

                {/* CONTENT */}
                <section className="
                    w-full
                    p-8 sm:p-10
                    flex-1
                    overflow-y-auto
                    custom-scrollbar
                    bg-white
                ">
                    <div className="max-w-prose mx-auto w-full">
                        <p className="
                            text-sm sm:text-base
                            text-justify
                            font-oasis-text
                            text-gray-700
                            leading-relaxed
                            whitespace-pre-wrap
                            break-words
                            w-full
                        ">
                            {content}
                        </p>
                    </div>
                </section>

                {/* FOOTER - Subtle indicator */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center items-center">
                    <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}

export function NotificationModal({ visible, onClose, notification }) {
    if (!visible || !notification) return null;

    const parseNotificationDate = (dateString) => {
        if (!dateString) return null;
        const date = dateString.endsWith("Z") ? new Date(dateString) : new Date(`${dateString}Z`);
        return date.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
    };

    return (
        <div className="fixed inset-0 z-200 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate__animated animate__zoomIn animate__faster">
                
                {/* HEADER */}
                <div className="p-8 bg-oasis-gradient flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-oasis-button-dark opacity-60">
                            Notification Detail
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <X size={20} className="text-oasis-button-dark" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 leading-tight mt-1">
                        {notification.title}
                    </h2>
                    <span className="text-xs text-gray-500 font-medium italic">
                        {parseNotificationDate(notification.created_at)}
                    </span>
                </div>

                {/* CONTENT */}
                <div className="p-8 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed font-oasis-text">
                        {notification.message}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-2.5 bg-oasis-header text-white rounded-xl font-bold text-sm hover:bg-oasis-button-dark transition-all shadow-lg shadow-oasis-header/20"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}