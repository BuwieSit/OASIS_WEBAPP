import { Link } from 'react-router-dom';
import oasisLogo from './assets/oasisLogo.png';
import Title from './utilities/title';
import Subtitle from './utilities/subtitle';
import LandingScreen from './layouts/landingScreen';

export default function NotFound() {
    return(
        <>
           <LandingScreen>
                <div className='w-full h-screen flex flex-col justify-center items-center gap-5'>
                    <h1 className='text-black font-normal font-oasis-text text-5xl'>404</h1>
                    <img src={oasisLogo} className='w-100 aspect-auto'></img>
                    <Title text={"Are you lost?"}/>
                    <Link to="/"><Subtitle text={"Click here to go back!"}/></Link>
                </div>
           </LandingScreen>
               
            
            
        </>
    )
}