import { UpperWave, LowerWave } from './utilities/waves';
import Title from './utilities/title';
import Subtitle from './utilities/subtitle';
import { CustomCard } from './utilities/card';
import LandingScreen from './layouts/landingScreen.jsx';
import fallbackImg from './assets/fallbackImage.jpg';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ViewModal } from './components/popupModal.jsx';
import { useState } from 'react';
import { TutorialCard } from './utilities/card';
export function HoverContainer({ children }) {
    return (
        <>
         <div className='w-full h-full flex flex-col items-center justify-center gap-5 cursor-pointer transition duration-150 ease-in-out hover:bg-white'>
            {children}
         </div>
        </>
    )
}

export default function LandingPage() {

    const [openView, setOpenView] = useState(false);

    return(
        <>
            <LandingScreen>
                <ViewModal 
                    visible={openView}
                    onClose={() => setOpenView(false)}
                    isVideo={true}
                    resourceTitle="What is OASIS?"
                />
                <div className='relative w-full p-5 flex flex-row justify-center items-center gap-10'>
                    <div className='flex flex-row justify-evenly items-center p-3 opacity-100 bg-oasis-blue w-150 aspect-video shadow-[4px_4px_2px_rgba(0,0,0,0.5)] '>   
                        <Link to="/access" className='w-full h-full flex flex-col items-center justify-center gap-5 cursor-pointer transition duration-150 ease-in-out hover:bg-white z-100'> 
                            <Subtitle size='text-[1.3rem]' text={"Access to OASIS"}/>
                             <LogIn size={40}/>
                        </Link>
                    </div>
                    <img src={fallbackImg} className='absolute opacity-20 pointer-events-none'/>
                </div>
                <UpperWave/>
                <div className='w-full min-h-150 h-auto pb-5 pt-5 bg-oasis-blue flex flex-wrap flex-col items-center justify-center'>
                     <section className='w-[50%] flex flex-col gap-2 mt-10'>
                        <Title text="What is OASIS?"/>
                        <Subtitle isCenter={true} size={'text-[0.9rem]'} text="OJT Administration Support, and Information System is your all-in-one platform for managing OJT requirements, announcements, and host establishment information. Explore the cards below to learn more!"/>
                    </section>
                    

                    <div className="w-[80%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-10 pb-10 justify-center place-items-center">

                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                    </div>
                </div>
                <LowerWave/>
            </LandingScreen>
        </>
    )
}