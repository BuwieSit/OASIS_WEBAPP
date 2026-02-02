import 'animate.css'

export default function Title({ text, size = ("text-2xl"), isAnimated = true, id}) {
    return (
        <>
            <h2 className={`${isAnimated ? "animate__animated animate__fadeInDown" : ""} font-oasis-text font-semibold ${size} bg-clip-text text-transparent bg-linear-to-t from-oasis-button-light to-oasis-button-dark text-center`} id={id}>{text}</h2>
        </>
    )
}