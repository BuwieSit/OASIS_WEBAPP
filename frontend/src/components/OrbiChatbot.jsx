import { useState, useEffect } from 'react';
import ChatField from '../utilities/chatField';
import orbi from "../assets/orbi.png";
import { SingleField } from './fieldComp';
import { Maximize2, Minus } from 'lucide-react';

    const [open, setOpen] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [onBubble, setOnBubble] = useState(false);

    const handleClick = () => {
        setOnBubble(false);
        setTimeout(() => setOnBubble(true), 10)
        setAnimate(false);
        requestAnimationFrame(() => setAnimate(true));
        setTimeout(() => {
            setOpen(prev => !prev);
        }, 200);

    }
export default function OrbiChatbot() {


    return (
        <>
            <img src={orbi} onClick={handleClick} className={`fixed bottom-[0%] right-[0%] z-100 w-35 aspect-square hover:cursor-pointer hover:scale-115 transition ease-in-out duration-200 drop-shadow-[3px_3px_10px_rgba(255,255,255,1)] hover:drop-shadow-[3px_3px_1px_rgba(0,0,0,1)] ${animate ? "animate__animated animate__jello" : ""}`} alt='orbiChatbot'/>
            
            {open && <FloatingChat open={open}/>}
            {onBubble && <BubbleAnim start={onBubble}/>}
        </>
    )
}


export function FloatingChat({ open }) {
  const [show, setShow] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    let timer;

    if (open) {

      timer = setTimeout(() => {
        setShow(true);
        setAnimationClass("bubble-pop"); 
      }, 400);
    } else {
      setAnimationClass("bubble-close");
      timer = setTimeout(() => setShow(false), 400); 
    }

    return () => clearTimeout(timer);
  }, [open]);

  if (!show) return null;

  return (
    // parent container
    <div
      className={`
        w-100 aspect-square p-5 fixed top-[60%] right-0
        translate-x-[-30%] -translate-y-1/2 z-100
        ${animationClass}
      `}
    >
        {/* Shown container */}
      <div className="w-full aspect-square bg-oasis-gradient
                      backdrop-blur-xs rounded-3xl p-2
                      shadow-[2px_2px_5px_rgba(0,0,0,0.9)] relative">
        <div className="w-full border-b px-3 py-2 flex flex-row justify-end items-center gap-3">
            <Minus size={20}/>
            <Maximize2 size={20}/>
        </div>
        {/* Messages Field */}
        <div className="w-full h-[80%] p-5 overflow-y-auto overflow-hidden">
          <ChatField isOrbi={true}/>
          <ChatField isUser={true}/>
          <ChatField isOrbi={true}/>
          <ChatField isUser={true}/>
          <ChatField isOrbi={true}/>
          <ChatField isUser={true}/>
          <ChatField isOrbi={true}/>
          <ChatField isUser={true}/>
          <ChatField isOrbi={true}/>
          <ChatField isUser={true}/>
        </div>

        <div className="w-full">
            <SingleField hasBorder={true} fieldHolder={"Enter message"} fieldId={"userMessage"}/>
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

