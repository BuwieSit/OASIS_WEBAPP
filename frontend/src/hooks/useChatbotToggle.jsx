import { useState } from "react";
import clickSound from '../assets/sounds/bubble.mp3';
import orbiHello from '../assets/sounds/orbi_hello.mp3';
import water from '../assets/sounds/water.mp3';

export function useChatbotToggle() {
    const [open, setOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [onBubble, setOnBubble] = useState(false);
    const playSound = () => {
        new Audio(water).play();
    };
    
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
        playSound();
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
