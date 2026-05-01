import { forwardRef } from "react";

const Subtitle = forwardRef(({
    isCenter = false,
    isJustify = false,
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
    isPreWrap = false,
    ariaLive
}, ref) => {

    const baseClasses = `
        ${isAnimated ? "animate__animated animate__fadeInDown" : ""}
        font-oasis-text
        ${weight}
        ${isJustify ? "text-justify" : ""}
        ${isCenter ? "text-center" : "text-start"}
        ${isPreWrap ? "whitespace-pre-wrap" : ""}
        ${size}
        ${color}
        ${isActive ? "font-bold border-0 border-b-5 border-b-oasis-header" : ""}
        ${isUnderlined ? "underline underline-offset-2" : ""}
        ${isItalic ? "italic" : ""}
        transition ease-in-out duration-500
        ${isMobile? "hidden md:block lg:block" : ""}
        
        ${className}
    `;

    return isLink ? (
        <a
            href={link}
            className={`${baseClasses} cursor-pointer hover:-translate-y-1 transition ease-in-out px-2`}
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


