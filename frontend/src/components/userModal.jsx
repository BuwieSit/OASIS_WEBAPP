import close from "../assets/icons/close.png"

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
            z-50
            bg-black/40
            flex items-center justify-center
            p-4
        ">

            {/* Modal Container */}
            <div className="
                relative
                w-full
                max-w-2xl
                max-h-[90vh]
                bg-white
                rounded-3xl
                shadow-2xl
                overflow-hidden
                flex flex-col
                animate-fadeIn
            ">

                {/* HEADER */}
                <section className="
                    w-full
                    p-5
                    bg-linear-to-b
                    from-oasis-button-light
                    via-oasis-blue
                    to-oasis-blue
                    flex flex-col
                    items-center
                    text-center
                ">
                    <h2 className="font-oasis-text font-bold text-lg sm:text-xl lg:text-2xl">
                        {title}
                    </h2>

                    <p className="font-oasis-text italic text-xs sm:text-sm mt-1">
                        {date} {time}
                    </p>
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
                <button
                    onClick={onClose}
                    className="
                        absolute
                        top-4
                        right-4
                        w-8 h-8
                        bg-oasis-button-dark
                        text-white
                        rounded-full
                        flex items-center justify-center
                        hover:scale-105
                        transition
                    "
                >
                    <img src={close} className="w-4 h-4 object-contain" />
                </button>

            </div>
        </div>
    );
}