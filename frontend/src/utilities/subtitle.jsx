import { forwardRef } from "react";

const Subtitle = forwardRef(({
    isCenter = false,
    text,
    color,
    size = "text-xs",
    weight = "font-normal",
    isUnderlined = false,
    isLink = false,
    isAnimated = false,
    link,
    id,
    className = "",
    onClick,
    isActive,
    isItalic,
    isMobile,
    ariaLive
}, ref) => {

    const baseClasses = `
        ${isAnimated ? "animate__animated animate__fadeInDown" : ""}
        font-oasis-text
        ${weight}
        ${isCenter ? "text-center" : "text-start"}
        ${size}
        ${color}
        ${isActive ? "font-bold underline underline-offset-2" : ""}
        ${isUnderlined ? "underline underline-offset-2" : ""}
        ${isItalic ? "italic" : ""}
        transition ease-in-out duration-500
        ${isMobile? "hidden md:block lg:block" : ""}
        ${className}
    `;

    return isLink ? (
        <a
            href={link}
            className={`${baseClasses} cursor-pointer hover:underline`}
            onClick={onClick}
        >
            {text}
        </a>
    ) : (
        <p
            className={baseClasses}
            id={id}
            onClick={onClick}
            ref={ref}
            aria-live={ariaLive}
        >
            {text}
        </p>
    );
});

export default Subtitle;


// export default function Subtitle({  isCenter = false , text, color, size = ('text-xs'), weight = ('font-normal'), isUnderlined = false, isLink = false, isAnimated = false, link, id, className, onClick, isActive, isItalic, ref, ariaLive}) {

//     return (
//         <>
//         {isLink ? 
//             <a href={link} className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text ${weight} ${isCenter ? "text-center" : "text-start"} ${size} text-center ${color} ${isActive ? "font-bold underline underline-offset-2":""} transition ease-in-out duration-500 ${isUnderlined ? "underline underline-offset-2": ""} hover:underline underline-offset-2 cursor-pointer hidden lg:flex`} 
//             onClick={onClick} target="_blank">
//                 {text}
//             </a> 
//         : 
//             <p 
//                 className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text ${weight} ${isCenter ? "text-center" : "text-start"} ${size} text-center ${color} ${isActive ? "font-bold underline underline-offset-2":""} transition ease-in-out duration-500 ${isUnderlined ? "underline underline-offset-2": ""} hidden lg:flex ${className}`} 
//                 id={id} 
//                 onClick={onClick}
//                 ref={ref}
//                 aria-live={ariaLive}
//             >
//                 {text}
//             </p>
//         }
            
//         </>
//     )
// }

