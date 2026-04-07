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
                <div className='relative w-full h-screen p-5 flex flex-col justify-center items-center gap-5'>
                    <Title text={"One system for every OJT need."} size='text-[4rem]'/>
                    <Subtitle color={"text-oasis-header"} text={"Track internships, manage records, and access essential information with OASIS – OJT Administration Support and Information System."} isItalic={true} size={"1rem"} className={"w-[50%]"} isCenter={true}/>
                    <Link to={"/access"}><Button text={"Get started"}/></Link>
                </div>

                <div className='w-full min-h-150 h-auto pb-5 pt-5 bg-oasis-blue flex flex-wrap flex-col items-center justify-center'>
                     <section className='w-full flex flex-col gap-2 mt-10'>
                        <Title text={"Tools to Streamline OJT Management"} size='text-[2.5rem]'/>
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
            </LandingScreen>
        </>
    )
}