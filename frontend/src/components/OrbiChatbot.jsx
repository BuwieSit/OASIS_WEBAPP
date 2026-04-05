import { useState, useEffect, useRef } from 'react';
import ChatField from '../utilities/chatField';
import orbi from '../assets/orbi.png';
import { SingleField } from './fieldComp';
import { Maximize2, Minimize2, Minus, SendHorizontal } from 'lucide-react';
import { useChatbotToggle } from '../hooks/useChatbotToggle';
import useOutsideClick from '../utilities/OutsideClick';
import api from '../api/axios';
import { getRole } from '../api/token';

const ORBI_BASE_URL = import.meta.env.VITE_ORBI_API_URL || "http://127.0.0.1:5050";

export default function OrbiChatbot() {
    const { open, animate, onBubble, closeChat, handleClick } = useChatbotToggle();
    const [userData, setUserData] = useState({
        userId: null,
        role: getRole() || "student"
    });

    useEffect(() => {
        async function fetchCurrentUser() {
            const role = getRole() || "student";

            try {
                if (role === "admin") {
                    const res = await api.get("/api/admin/me");
                    setUserData({
                        userId: res?.data?.user?.id || "admin-temp-id",
                        role: "admin"
                    });
                    return;
                }

                const res = await api.get("/api/student/me");
                setUserData({
                    userId: res?.data?.user?.id || "student-temp-id",
                    role: "student"
                });
            } catch (error) {
                console.error("Failed to fetch ORBI user context:", error);
                setUserData({
                    userId: "guest-temp-id",
                    role: role
                });
            }
        }

        fetchCurrentUser();
    }, []);

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

            {open && (
                <FloatingChat
                    open={open}
                    onClose={closeChat}
                    userId={userData.userId}
                    role={userData.role}
                />
            )}
            {onBubble && <BubbleAnim start={onBubble} />}
        </>
    );
}

export function FloatingChat({ open, onClose, userId, role }) {
    const [show, setShow] = useState(false);
    const [animationClass, setAnimationClass] = useState("");
    const [isMaximized, setIsMaximized] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "orbi",
            text: "Hi! I’m ORBI. You can ask me about OJT portfolio requirements, the OJT journey, and the MOA process."
        }
    ]);

    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    const sendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || isSending) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: trimmedMessage
        };

        setMessages((prev) => [...prev, userMessage]);
        setMessage("");
        setIsSending(true);

        try {
            const response = await fetch(`${ORBI_BASE_URL}/orbi/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId || "guest-temp-id",
                    role: role || "student",
                    message: trimmedMessage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to get ORBI response.");
            }

            const orbiMessage = {
                id: Date.now() + 1,
                sender: "orbi",
                text: data?.reply || "ORBI could not generate a response."
            };

            setMessages((prev) => [...prev, orbiMessage]);
        } catch (error) {
            console.error("ORBI chat error:", error);

            const errorMessage = {
                id: Date.now() + 2,
                sender: "orbi",
                text: "I couldn’t connect to ORBI right now. Please make sure the ORBI server is running."
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!show) return null;

    return (
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
                <div className="w-full border-b px-5 py-4 flex justify-between items-center">
                    <div className="flex gap-4 justify-end w-full">
                        {isMaximized ? (
                            <Minimize2
                                size={25}
                                color="#2B6259"
                                className="cursor-pointer"
                                onClick={() => setIsMaximized(false)}
                            />
                        ) : (
                            <Maximize2
                                size={25}
                                color="#2B6259"
                                className="cursor-pointer"
                                onClick={() => setIsMaximized(true)}
                            />
                        )}

                        <Minus
                            size={25}
                            color="#2B6259"
                            className="cursor-pointer"
                            onClick={onClose}
                        />
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {messages.map((chat) => (
                        <ChatField
                            key={chat.id}
                            isOrbi={chat.sender === "orbi"}
                            isUser={chat.sender === "user"}
                            text={chat.text}
                        />
                    ))}

                    {isSending && (
                        <ChatField
                            isOrbi
                            text="ORBI is thinking..."
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="w-full p-4">
                    <div className="flex items-center gap-3">
                        <div onKeyDown={handleKeyDown} className="w-full">
                            <SingleField
                                hasBorder={true}
                                fieldHolder="Enter message"
                                fieldId="userMessage"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isSending}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={sendMessage}
                            disabled={isSending || !message.trim()}
                            className="rounded-full p-2 hover:bg-white transition group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SendHorizontal
                                size={22}
                                color="#2D6259"
                                className="cursor-pointer group-hover:-rotate-12 transition"
                            />
                        </button>
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
                if (onEnd) onEnd();
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [start, onEnd]);

    if (!show) return null;

    return <div className="flying-bubble" />;
}