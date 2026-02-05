import { useState } from "react";

export function useChatbotToggle() {
    const [open, setOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [onBubble, setOnBubble] = useState(false);

    const openChat = () => {
        if (open) return;

        setOnBubble(false);
        setTimeout(() => setOnBubble(true), 10);

        setAnimate(false);
        requestAnimationFrame(() => setAnimate(true));

        setTimeout(() => setOpen(true), 200);
    };

    const closeChat = () => {
        setOpen(false);
    };
    
    const handleClick = () => {
        setOnBubble(false);
        setTimeout(() => setOnBubble(true), 10);

        setAnimate(false);
        requestAnimationFrame(() => setAnimate(true));

        setTimeout(() => {
        setOpen(prev => !prev);
        }, 200);
    };

    return {
        open,
        animate,
        onBubble,
        openChat,
        closeChat,
        handleClick
    };
}
