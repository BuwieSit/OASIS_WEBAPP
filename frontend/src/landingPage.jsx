import { UpperWave, LowerWave } from './utilities/waves';
import Title from './utilities/title';
import Subtitle from './utilities/subtitle';
import { CustomCard } from './utilities/card';
import LandingScreen from './layouts/landingScreen.jsx';
import fallbackImg from './assets/fallbackImage.jpg';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    return(
        <>
            <LandingScreen>
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
                    <Title text="What is OASIS?"/>
                    <Subtitle text="OJT Administration Support, and Information System is your all-in-one platform for managing OJT requirements, announcements, and host establishment information. Explore the cards below to learn more!"/>

                    <div className="w-[80%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-10 pb-10 justify-center place-items-center">

                        <CustomCard title={"Purpose"} desc={"OASIS aims to simplify and digitize internship management — making information, forms, and updates easily accessible for students and coordinators."}></CustomCard>
                        <CustomCard title={"Announcements"} desc={"Never miss an important deadline or announcement. This page keeps students informed of all OJT-related updates in real time."}></CustomCard>
                        <CustomCard title={"Downloadable"} desc={"Access all internship documents in one place — including MOAs, accomplishment sheets, evaluation forms, and consent letters."}></CustomCard>
                        <CustomCard title={"HTE Dashboard"} desc={"View all partner HTEs, track their MOA validity, and monitor which establishments are active or due for renewal."}></CustomCard>
                        <CustomCard title={"OJT Hub"} desc={"OASIS aims to simplify and digitize internship management — making information, forms, and updates easily accessible for students and coordinators."}></CustomCard>
                        <CustomCard title={"ORBI"} desc={"ORBI serves as the digital companion of every OASIS user — ensuring no question goes unanswered and every student receives timely, reliable, and friendly support throughout their internship journey."}></CustomCard>
                    </div>
                </div>
                <LowerWave/>
            </LandingScreen>
        </>
    )
}