import 'animate.css';
import HoverLift from './hoverLift';

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

export function AnnounceButton({
  type = "button",
  textSize,
  btnText = "Posted",
  onClick,
  disabled,
  icon,
  isFullWidth = false,
  isRed,
  className
}) {
  const text = btnText.toLowerCase();

  const isDanger = ["delete", "reject", "clear all", "clear"].includes(text) || isRed;
  const isNeutral = ["cancel", "sign in"].includes(text);
  const isPending = ["pending"].includes(text);
  const isUpload = ["upload file", "upload"].includes(text);

  const buttonStyle = isNeutral
    ? "bg-[#D3D3D3] hover:bg-[#A9A9A9] text-black"
    : isDanger
    ? "bg-red-900 hover:bg-red-700 text-white"
    : isPending
    ? "bg-amber-500 hover:bg-amber-700 text-black"
    : isUpload
    ? "bg-white border border-gray-400 hover:bg-gray-100 text-black"
    : "bg-oasis-button-dark hover:bg-oasis-button-light text-white";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-oasis-text
        ${textSize || "text-xs sm:text-sm"}

        ${isFullWidth ? "w-full" : "w-auto"}

        flex items-center justify-center
        gap-1.5 sm:gap-2

        px-3 py-1.5
        sm:px-4 sm:py-2

        rounded-full
        transition-all duration-200
        border border-gray-400
        hover:cursor-pointer

        disabled:opacity-50 disabled:cursor-not-allowed

        ${buttonStyle}
        ${className}
      `}
    >
      {icon && (
        <span className="flex items-center shrink-0">
          {icon}
        </span>
      )}

      <span className="break-words text-center leading-tight">
        {btnText}
      </span>
    </button>
  );
}


export function CoursesButton({ onClick, isActive, text, type = "button"}) {

    return (
        <>
        <HoverLift>
            <button type={type} onClick={onClick}  
              className={`
                rounded-3xl border  
                text-black font-bold font-oasis-text text-[0.8rem] 
                px-4 py-2 cursor-pointer
                hover:bg-oasis-header hover:text-white hover:drop-shadow-[0px_2px_2px_rgba(0,0,0,0.2)] 
                transition duration-100 ease-out 
                active:scale-90
                ${isActive ? "bg-oasis-header drop-shadow-[0px_2px_2px_rgba(0,0,0,0.2)] text-white" : "bg-white"}`}>{text}</button>
        </HoverLift>
            
        </>
    )
}
