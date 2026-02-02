import itechLogo from '../assets/itechLogo.png'
import pupLogo from '../assets/pupLogo.png'

export default function LogoWrap() {
    return (
        <>
            <div className='flex flex-row '>
                <img src={pupLogo} className='w-10 aspect-auto'></img>
                <img src={itechLogo} className='w-10 aspect-auto'></img>
            </div>
            

        </>
    )
}