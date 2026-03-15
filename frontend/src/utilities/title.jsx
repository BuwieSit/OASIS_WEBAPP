import 'animate.css'

export default function Title({ text, size = ("text-2xl"), isAnimated = false, id}) {
    return (
        <>
            <h2 className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text font-bold ${size} bg-clip-text text-transparent bg-linear-to-b from-oasis-button-dark from-40% via-oasis-button-light via-65% to-oasis-blue text-center z-80 pointer-events-none`} id={id}>{text}</h2>
        </>
    )
}