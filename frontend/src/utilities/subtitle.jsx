
export default function Subtitle({  isCenter = false , text, color, size = ('text-xs'), weight = ('font-normal'), isUnderlined = false, isLink = false, isAnimated = false, link, id, className, onClick, isActive, isItalic}) {

    return (
        <>
        {isLink ? 
            <a href={link} className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text ${weight} ${isCenter ? "text-center" : "text-start"} ${size} text-center ${color} ${isActive ? "font-bold underline underline-offset-2":""} transition ease-in-out duration-500 ${isUnderlined ? "underline underline-offset-2": ""} hover:underline underline-offset-2 cursor-pointer`} 
            onClick={onClick} target="_blank">
                {text}
            </a> 
        : 
            <p className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text ${weight} ${isCenter ? "text-center" : "text-start"} ${size} text-center ${color} ${isActive ? "font-bold underline underline-offset-2":""} transition ease-in-out duration-500 ${isUnderlined ? "underline underline-offset-2": ""} ${className}`} 
            id={id} 
            onClick={onClick}>
                {text}
            </p>
        }
            
        </>
    )
}