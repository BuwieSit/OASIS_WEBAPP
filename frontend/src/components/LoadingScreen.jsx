import { useState, useEffect } from "react";
import SvgLoader from "./SvgLoader";
import { useLoading } from "../context/LoadingContext";

const LOADING_MESSAGES = [
    "Uncovering a hidden oasis...",
    "Sifting through the sands of data...",
    "Following the path to the oasis...",
    "Quenching your thirst for information...",
    "Navigating the shifting dunes...",
    "Drawing water from the data spring...",
    "Planting seeds for your OJT journey...",
    "Resting under the palms of progress...",
    "Tracing the OJT mirage into reality...",
    "Saddling up for the next phase..."
];

export default function LoadingScreen() {
    const { loading } = useLoading();
    const [messageIndex, setMessageIndex] = useState(0);
    const [shouldRender, setShouldRender] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Sync visibility with global loading state
    useEffect(() => {
        if (loading) {
            // Randomize starting message
            setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
            setShouldRender(true);
            setIsExiting(false);
        } else if (shouldRender) {
            // Start exit animation
            setIsExiting(true);
            const timeout = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 800); // Duration of the circle-in animation
            return () => clearTimeout(timeout);
        }
    }, [loading, shouldRender]);

    // Message rotation
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [loading]);

    if (!shouldRender) return null;

    return (
        <div 
            className={`
                fixed inset-0 z-9999 flex items-center justify-center bg-white
                transition-all duration-700 ease-in-out
                ${isExiting ? "iris-out" : "clip-full"}
            `}
        >
            <style>
                {`
                    .clip-full {
                        clip-path: circle(150% at 50% 50%);
                    }
                    .iris-out {
                        clip-path: circle(0% at 50% 50%);
                    }
                `}
            </style>

            <div className={`
                flex flex-col items-center gap-6 px-10 py-8
                ${isExiting ? "animate__animated animate__zoomOut animate__faster" : "animate__animated animate__fadeIn"}
            `}>
                
                <div className="scale-150">
                    <SvgLoader/>
                </div>

                <p key={messageIndex} className="font-oasis-text text-oasis-button-dark text-sm font-black tracking-widest uppercase text-center animate__animated animate__fadeInUp animate__faster">
                    {LOADING_MESSAGES[messageIndex]}
                </p>
            </div>
        </div>
    );
}
