import oasisLogo from '../assets/oasisLogo.png'

export default function LogregScreen({ children }) {
    return(
        <>
            <div className='w-full h-dvh bg-linear-to-l from-oasis-dark via-oasis-blue to-white grid lg:grid-cols-2 place-items-center justify-items-center overflow-x-hidden'>

                <div className={`animate__animated animate__fadeIn w-full h-dvh bg-linear-to-t from-oasis-aqua via-white to-white z-20 duration-500 ease-in-out hidden lg:flex justify-center items-center `}>
                    <img src={oasisLogo} className='w-[70%] object-contain aspect-video'/>
                </div>
                {children}
            </div>
        </>
    )
}