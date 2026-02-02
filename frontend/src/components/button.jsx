import 'animate.css';
import HoverLift from './hoverLift';
import add from "../assets/icons/add.png";
import close from "../assets/icons/close.png"

export function Button({ text, onClick, disabled, width = "w-auto", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`animate__animated animate__fadeIn min-w-70 ${width} p-3 shadow-[0px_3px_5px_rgba(0,0,0,0.8)] bg-linear-to-t from-oasis-button-dark from-10%  via-oasis-button-light via-70% to-oasis-blue to-120% font-oasis-text text-white font-semibold cursor-pointer ease-in duration-100 hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-0 rounded-2xl`}
    >
      {text}
    </button>
  );
}


export function AnnounceButton({ type="button", btnText = "Posted", onClick, disabled,  icon}) {
    const text = btnText.toLowerCase();

    const isDanger = ["delete", "reject", "clear all", "clear"].includes(text);
    const isNeutral = ["cancel"].includes(text);
    const isPending = ["pending"].includes(text);

    const buttonStyle = isNeutral
        ? "bg-[#D3D3D3] hover:bg-[#A9A9A9] text-black"
        : isDanger
        ? "bg-red-900 hover:bg-red-700 text-white"
        : isPending 
        ? "bg-amber-500 hover:bg-amber-700 text-black" 
        : "bg-oasis-button-dark hover:bg-oasis-button-light text-white"

    return (
        <button
            type={type}
            onClick={onClick}
            className={`font-oasis-text text-[0.8rem] text-center py-2 px-5 w-auto flex flex-row items-center justify-center gap-3 max-w-70 rounded-3xl transition-all duration-200 hover:cursor-pointer ${buttonStyle} `}
            disabled={disabled}
        >
            {icon}
            {btnText}
        </button>
    );
}


export function CoursesButton({ onClick, text, type = "button"}) {

    return (
        <>
        <HoverLift>
            <button type={type} onClick={onClick} className='rounded-3xl border bg-white text-black font-bold font-oasis-text text-[0.8rem] px-4 py-2 hover:bg-oasis-aqua hover:cursor-pointer hover:border-transparent hover:drop-shadow-[0px_5px_2px_rgba(0,0,0,0.5)] transition duration-100 ease-out'>{text}</button>
        </HoverLift>
            
        </>
    )
}

export function AddButton({ onClick, type = "button", width = "w-25", height = "h-10", iconSize = "w-5 h-5" }) {
    return (
        <button type={type} onClick={onClick} className={`${width} ${height} rounded-full bg-oasis-button-light flex items-center justify-center hover:bg-oasis-button-dark hover:cursor-pointer transition`}>
            
            <img src={add} alt="Add" className={`${iconSize} object-contain`}/>

        </button>
    );
}

export function CloseButton({ onClick, type = "button"}) {
    return (
        <>
            <button className="w-9 absolute top-1 right-1/15 translate-x-1/2 translate-y-1/2 p-2 bg-oasis-button-dark text-white rounded-full hover:cursor-pointer"
            onClick={onClose}><img src={close} className="object-contain w-full" /></button>
        </>
    )
}