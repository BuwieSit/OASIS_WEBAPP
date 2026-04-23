import Title from './utilities/title';
import Subtitle from './utilities/subtitle';
import LandingScreen from './layouts/landingScreen.jsx';
import { Link } from 'react-router-dom';
import { ViewModal } from './components/popupModal.jsx';
import { useEffect, useState } from 'react';
import { TutorialCard } from './utilities/card';
import { Button } from './components/button.jsx';

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

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_API_BASE_URL;

        fetch(`${backendUrl}/health-check`)
            .then(() => console.log("Backend warming up..."))
            .catch(() => console.log("Backend wake-up initiated"));
            
        // PRELOAD FUNCTION: Starts downloading the UserAccess code chunk early
        import('./pages/userAccess').then(() => {
            console.log("Access page resources pre-fetched!");
        });
    }, []);

    return(
        <>
            <LandingScreen>
                <ViewModal 
                    visible={openView}
                    onClose={() => setOpenView(false)}
                    isVideo={true}
                    resourceTitle="What is OASIS?"
                />
                <div className='relative w-full h-[85vh] md:h-screen p-6 flex flex-col justify-center items-center gap-8'>
                    <Title 
                        text={"One system for every OJT need."} 
                        size='text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] leading-[1.1]'
                    />
                    <Subtitle 
                        color={"text-oasis-header"} 
                        text={"Track internships, manage records, and access essential information with OASIS – OJT Administration Support and Information System."} 
                        isItalic={true} 
                        size={"text-lg md:text-xl"} 
                        className={"w-[95%] sm:w-[80%] md:w-[60%] lg:w-[50%] opacity-90 leading-relaxed"} 
                        isCenter={true}
                    />
                    <Link to={"/access"} className="mt-6 transform transition hover:scale-105 active:scale-95">
                        <Button text={"Get started"} className="px-10 py-4 text-lg"/>
                    </Link>
                </div>

                <div className='w-full min-h-[60vh] h-auto pb-20 pt-10 bg-oasis-blue flex flex-col items-center justify-center px-5'>
                     <section className='w-full flex flex-col gap-2 mb-10'>
                        <Title 
                            text={"Tools to Streamline OJT Management"} 
                            size='text-[1.8rem] sm:text-[2.2rem] md:text-[2.5rem]'
                        />
                    </section>
                    

                    <div className="w-full sm:w-[90%] lg:w-[80%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center place-items-center">
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                        <TutorialCard onClick={() => setOpenView(true)}/>
                    </div>
                </div>
            </LandingScreen>
        </>
    )
}