import { useState, useEffect, useRef } from 'react';
import ChatField from '../utilities/chatField';
import orbi from '../assets/orbi.png';
import { SingleField } from './fieldComp';
import { Maximize2, Minimize2, Minus, SendHorizontal } from 'lucide-react';
import { useChatbotToggle } from '../hooks/useChatbotToggle';
import useOutsideClick from '../utilities/dropdownBehavior';


export default function OrbiChatbot() {

    const { open, animate, onBubble, closeChat, handleClick } = useChatbotToggle();

    return (
        <>
            <img
                src={orbi}
                onClick={handleClick}
                alt="orbiChatbot"
                className={`
                    fixed
                    bottom-4 right-4
                    sm:bottom-6 sm:right-6
                    lg:bottom-8 lg:right-8
                    z-150

                    w-16 sm:w-20 md:w-24 lg:w-28
                    aspect-square

                    cursor-pointer
                    transition-all duration-200 ease-in-out

                    hover:scale-110
                    hover:drop-shadow-[3px_3px_5px_rgba(0,0,0,0.4)]

                    ${animate ? "animate__animated animate__jello" : ""}
                `}
            />

            {open && <FloatingChat open={open} onClose={closeChat} />}
            {onBubble && <BubbleAnim start={onBubble} />}
        </>
    );
}


export function FloatingChat({ open, onClose }) {

    const [show, setShow] = useState(false);
    const [animationClass, setAnimationClass] = useState("");
    const [isMaximized, setIsMaximized] = useState(false);
    const dropdownRef = useRef(null);
    
    useOutsideClick(dropdownRef, () => {
        onClose();
    });
    
    useEffect(() => {
        let timer;

        if (open) {
            timer = setTimeout(() => {
                setShow(true);
                setAnimationClass("bubble-pop");
            }, 200);
        } else {
            setAnimationClass("bubble-close");
            timer = setTimeout(() => setShow(false), 200);
        }

        return () => clearTimeout(timer);
    }, [open]);

    if (!show) return null;

    return (
        // parent
        <div
            className="

                fixed inset-0
                z-150
                w-full
                h-screen
                flex items-center justify-center
                bg-black/30
                p-4"
        >
            {/* floating chat */}
            <div
                className={`
                    fixed z-50
                    ${isMaximized
                        ? "w-[90%] h-[90%] rounded-3xl animate__animate animate__bounceIn"    
                        : "bottom-4 right-4 w-full max-w-xs sm:max-w-sm md:max-w-md h-[60vh] sm:h-[70vh] md:h-[80vh] rounded-3xl animate__animate animate__bounceIn" 
                    }

                    bg-page-white backdrop-blur-xs
                    shadow-2xl
                    flex flex-col overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${animationClass}
                `}
                style={{ transformOrigin: isMaximized ? "center center" : "bottom right" }}
                ref={dropdownRef}
            >

                {/* HEADER */}
                <div className="w-full border-b px-5 py-4 flex justify-between items-center">
                    <div className="flex gap-4 justify-end w-full">
                        {isMaximized ? 
                            <Minimize2 size={25} color='#2B6259' className='cursor-pointer' onClick={() => setIsMaximized(false)}/> 
                            : 
                            <Maximize2 size={25} color='#2B6259' className='cursor-pointer' onClick={() => setIsMaximized(true)}/> 
                        }
                        
                        <Minus size={25} color='#2B6259' className="cursor-pointer" onClick={onClose} />
                    </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <ChatField isOrbi />
                    <ChatField isUser />
                    <ChatField isOrbi />
                    <ChatField isUser />
                </div>

                {/* INPUT */}
                <div className="w-full p-4">
                    <div className="flex items-center gap-3">
                        <SingleField
                            hasBorder={true}
                            fieldHolder="Enter message"
                            fieldId="userMessage"
                        />

                        <div className="rounded-full p-2 hover:bg-white transition group">
                            <SendHorizontal
                                size={22}
                                color="#2D6259"
                                className="cursor-pointer group-hover:-rotate-12 transition"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export function BubbleAnim({ start, onEnd }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (start) {
        setShow(true);

        const timer = setTimeout(() => {
            setShow(false);
            if (onEnd) onEnd(); // optional callback
        }, 800); 

        return () => clearTimeout(timer);
        }
    }, [start, onEnd]);

    if (!show) return null;

    return <div className="flying-bubble" />;
}

