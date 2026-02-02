
export default function Subtitle({  isCenter = false , text, color, size = ('text-xs'), weight = ('font-normal'), isUnderlined = false, isLink = false, isAnimated = false, link, id}) {

    return (
        <>
        {isLink ? 
        <a href={link} className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text ${weight} ${isCenter ? "text-center" : "text-start"} ${size} text-center ${color} transition ease-in-out duration-500 ${isUnderlined ? "underline underline-offset-2": ""} hover:underline underline-offset-2 cursor-pointer`}>{text}</a> 
        : 
        <p className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text ${weight} ${isCenter ? "text-center" : "text-start"} ${size} text-center ${color} transition ease-in-out duration-500 ${isUnderlined ? "underline underline-offset-2": ""} `} id={id}>{text}</p>}
            
        </>
    )
}