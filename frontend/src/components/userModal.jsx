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
        <>
            <div className="z-120 fixed pointer-events-none top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-full h-full bg-[rgba(0,0,0,0.3)] transition duration-200 ease-in">
                {/* parent modal */}
                <div className="pointer-events-auto fixed top-1/2 left-1/2  translate-x-[-50%] translate-y-[-50%] z-130 w-150 h-120 rounded-3xl drop-shadow-[0px_0px_10px_rgba(0,0,0,1)] overflow-hidden ">

                    <section className="w-full p-3 min-h-[30%] backdrop-blur-2xl border-oasis-button-dark bg-linear-to-b from-oasis-button-light via-oasis-blue to-oasis-blue flex flex-col justify-center items-center">
                        <h2 className="font-oasis-text font-bold text-[1.5rem]">{title}</h2>
                        <p className="font-oasis-text italic text-[0.9rem]">{date} {time}</p>
                    </section>
                    <section className="w-full min-h-[70%] p-3 bg-white flex flex-col justify-start items-center">
                            <p className="w-[80%] max-h-full text-[0.9rem] text-justify font-oasis-text">{content}</p>
                            <button className="w-9 absolute top-1 right-1/15 translate-x-1/2 translate-y-1/2 p-2 bg-oasis-button-dark text-white rounded-full hover:cursor-pointer"
                            onClick={onClose}><img src={close} className="object-contain w-full" /></button>
                    </section>

                </div>
            </div>
            
        </>
    )
}
