import itechLogo from '../assets/itechLogo.png'
import pupLogo from '../assets/pupLogo.png'

export default function LogoWrap({ className}) {
    return (
        <>
            <div className={`hidden md:flex lg:flex flex-row ${className}`}>
                <img src={pupLogo} className='w-10 aspect-auto'></img>
                <img src={itechLogo} className='w-10 aspect-auto'></img>
            </div>
            
        </>
    )
}