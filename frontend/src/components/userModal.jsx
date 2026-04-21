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
            bg-black/40
            flex items-center justify-center
            p-4
        ">

            {/* Modal Container */}
            <div className="
                relative
                w-2xl
                h-[90vh]
                bg-white
                rounded-3xl
                shadow-2xl
                overflow-hidden
                flex flex-col
                animate-fadeIn
                border border-oasis-gray
            ">

                {/* HEADER */}
                <section className="
                    relative
                    w-full
                    p-5
                    bg-linear-to-b
                    from-oasis-button-light
                    via-oasis-blue
                    to-oasis-blue
                    flex flex-col
                    items-center
                    text-center
                    overflow-hidden
                ">
                    <img 
                        src={pupImage} 
                        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-10 pointer-events-none object-contain transition-transform ' 
                        alt=""
                    />
                    <h2 className="font-oasis-text font-bold text-lg sm:text-xl lg:text-2xl capitalize">
                        {title}
                    </h2>

                    {date && (
                        <p className="font-oasis-text text-oasis-gray italic text-xs sm:text-sm mt-1 opacity-80">
                            {date} {time ? `• ${time}` : ""}
                        </p>
                    )}
                </section>

                {/* CONTENT */}
                <section className="
                    w-full
                    p-5
                    flex-1
                    overflow-y-auto
                ">
                    <p className="
                        text-sm sm:text-base
                        text-justify
                        font-oasis-text
                        leading-relaxed
                    ">
                        {content}
                    </p>
                </section>

                {/* CLOSE BUTTON */}
                <X  onClick={onClose} 
                    className="
                        absolute
                        top-4
                        right-4
                        w-8 h-8
                        text-oasis-header
                        rounded-full
                        flex items-center justify-center
                        hover:scale-105
                        transition
                        cursor-pointer
                    "/>

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