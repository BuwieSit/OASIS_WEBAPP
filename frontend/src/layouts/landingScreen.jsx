
export default function LandingScreen( { children }) {

    return (
        <>
            <div className={`w-full h-full pb-5 bg-[#F4FCF8] flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto`}>
                {children}
            </div>
        </>
    )
}
