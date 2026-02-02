import { Header, StudentHeader } from '../components/headers'
import Footer from '../components/footer'   
import orbi from "../assets/orbi.png";
import ProspectMoaForm from '../components/prospectMoaForm';
import ChatField from '../utilities/chatField';
import { useState, useEffect } from 'react';


export default function MainScreen({ children,  showHeader = true, hasTopMargin = true, isRow = false}) {
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
    return(
        <>
            <div className={`w-full h-full pb-5 bg-[#F4FCF8] flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto`}>
                <Header /> 
                {showHeader ? <StudentHeader/> : ""}
                {hasTopMargin ? <div className='mt-25'></div> : ""}
                {children}
                <img src={orbi} onClick={handleClick} className={`fixed bottom-[0%] right-[0%] z-100 w-35 aspect-square hover:cursor-pointer hover:scale-115 transition ease-in-out duration-200 drop-shadow-[3px_3px_10px_rgba(255,255,255,1)] hover:drop-shadow-[3px_3px_1px_rgba(0,0,0,1)] ${animate ? "animate__animated animate__jello" : ""}`} alt='orbiChatbot'/>

                {open && <FloatingChat open={open}/>}
                {onBubble && <BubbleAnim start={onBubble}/>}

                <div className='my-20'></div>
                <ProspectMoaForm/>
                <Footer />
            </div>
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
    <div
      className={`
        w-100 aspect-square p-5 fixed top-[60%] right-0
        translate-x-[-30%] -translate-y-1/2 z-100
        ${animationClass}
      `}
    >
      <div className="w-full aspect-square bg-[rgba(255,255,255,0.5)]
                      backdrop-blur-xs rounded-3xl p-5
                      shadow-[2px_2px_5px_rgba(0,0,0,0.9)] relative">
        <div className="w-full h-full p-5 border">
          <ChatField />
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

