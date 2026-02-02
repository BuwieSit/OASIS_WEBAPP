
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainScreen from '../../layouts/mainScreen';
import Accordion from '../../components/accordion';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import Download from "../../assets/icons/download.png";
import useQueryParam from '../../hooks/useQueryParams';

export default function OjtHub() {
    
    const [activeFilter, setActiveFilter] = useQueryParam("tab", "guidelines");

    
    return(
        <>
            <MainScreen>
                <div className='w-full flex flex-col items-center mb-10'>
                    <Title text={"OJT Hub"} size="text-[3rem]"/>
                    <Subtitle size={"text-[1rem]"} color={"text-oasis-button-dark"} text={"See the guidelines, procedures, and requirements regarding On-The-Job training!"}/>
                 </div>

                {/* PARENT CONTAINER */}
                <div className='w-full p-20 flex flex-row justify-evenly items-start duration-500 transition ease-in-out'>
                     <div className='w-[70%] p-2 flex flex-col justify-center items-center gap-20'>
                        {/* RENDER CONTENTS */}
                        {activeFilter === "guidelines" && <Guidelines/>}
                        {activeFilter === "procedures" && <Procedures/>}
                        {activeFilter === "moaprocess" && <MoaProcess/>}
                        {activeFilter === "keyguidelines" && <KeyGuidelines/>}
                        {activeFilter === "formstemplates" && <FormsTemplates/>}
                        {activeFilter === "ojtportfolio" && <OjtPortfolio/>}
                    </div>  
                    
                        <div className='w-70 bg-linear-to-top bg-oasis-gradient sticky top-10 self-start p-5 rounded-3xl'>
                            <section className='w-full border-b-2 py-2'>
                                <Subtitle text={"Contents"} size={"text-[1rem]"} weight={"font-bold"}/>
                            </section>
                            <section className='w-full flex flex-col gap-3 mt-5'>
                                <SideNavText 
                                    text={"Guidelines"} 
                                    onClick={() => setActiveFilter("guidelines")}
                                    isActive={activeFilter === "guidelines"}
                                />
                                <SideNavText 
                                    text={"Procedures"} 
                                    onClick={() => setActiveFilter("procedures")}
                                    isActive={activeFilter === "procedures"}
                                />
                                <SideNavText 
                                    text={"MOA Process"} 
                                    onClick={() => setActiveFilter("moaprocess")}
                                    isActive={activeFilter === "moaprocess"}
                                />
                                <SideNavText 
                                    text={"Key Guidelines"}
                                    onClick={() => setActiveFilter("keyguidelines")}
                                    isActive={activeFilter === "keyguidelines"} 

                                />
                                <SideNavText 
                                    text={"Internship Forms and Templates"} 
                                    onClick={() => setActiveFilter("formstemplates")}
                                    isActive={activeFilter === "formstemplates"} 
                                />
                                <SideNavText 
                                    text={"OJT Portfolio"} 
                                    onClick={() => setActiveFilter("ojtportfolio")}
                                    isActive={activeFilter === "ojtportfolio"} 
                                />
                            </section>
                        </div>

                </div>  
               
            </MainScreen>
        </>
    )
}

export function SideNavText({ text, link, isActive = false, onClick }) {
    return (
        <>
            <div className='py-2 duration-300 transition ease-in-out'>
                <a href={`#${link}`} 
                className={`text-[0.9rem] font-oasis-text cursor-pointer hover:underline underline-offset-2 hover:text-oasis-button-dark
                ${isActive ? "underline underline-offset-2 text-oasis-button-dark" : ""}
                `} onClick={onClick}>{text}</a>
            </div>
        </>
    )
}

export function Guidelines() {
    return (
        <>
             <section className='w-full flex flex-col items-start justify-center gap-5'>
                <Title text={"Guidelines"} isAnimated={false} id={"guidelines"}/>
                <div className='w-full border' ></div>
                <Subtitle size={"text-[0.9rem]"} text={"Welcome to OASIS, your partner in a seamless internship journey. Read the procedures carefully to understand the pre-internship, during, and post-internship requirements."}/>
            </section>
        </>
    )
}

export function Procedures() {
    return (
        <>
            <section className='w-full flex flex-col items-start justify-center gap-5'>
                <Title text={"Procedures"} isAnimated={false} id={"procedures"}/>
                <div className='w-full border'></div>

                <Accordion headerText={"Before Internship"}>

                </Accordion>
            </section>
        </>
    )
}

export function MoaProcess() {
    return (
        <>
            <section className='w-full flex flex-col items-start justify-center gap-5'>
                <Title text={"MOA Process"} isAnimated={false} id={"moaProcess"}/>
                <div className='w-full border'></div>
                
                <Accordion headerText={"MOA Process (HTE without an existing MOA)"}>

                </Accordion>
            </section>
        </>
    )
}

export function KeyGuidelines() {
    return (
        <>  
            <section className='w-full flex flex-col items-start justify-center gap-5'>
                <Title text={"Key Guidelines"} isAnimated={false} id={"keyGuidelines"}/>
                <div className='w-full border'></div>
                
                <Accordion headerText={"Important reminders"}>

                </Accordion>
            </section>
        </>
    )
}

export function FormsTemplates() {
    return (
        <>
            <section className='w-full flex flex-col items-start justify-center gap-5'>
                <Title text={"Internship Forms and Templates"} isAnimated={false} id={"formsTemplates"}/>
                <div className='w-full border'></div>

                <div className="w-full p-4 flex flex-row items-center gap-5 bg-oasis-blue rounded-2xl overflow-hidden transition-all cursor-pointer hover:underline underline-offset-2">
                    <img src={Download}/>
                    <Subtitle size={"text-[1rem]"} color={"text-oasis-button-dark"} weight={"font-bold"} text={"Weekly Accomplishment"}/>
                </div>
            </section>
        </>
    )
}

export function OjtPortfolio() {

    return (
        <>
            <div className='w-full p-5 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] 
            font-oasis-text'>
                <section className='w-full py-5 border-b flex flex-col justify-center items-center'>
                    <h2 className='font-bold font-oasis-title text-[1.5rem]'>HEADER</h2>
                </section>  

                <section className='w-full mt-5 mb-5 flex justify-center items-center'>
                    <h3 className='font-bold font-oasis-text'>TABLE OF CONTENTS</h3>
                </section>

                <section className='w-full grid grid-cols-2 py-2 px-10 mb-10'>
                    <p className='font-bold cursor-pointer'>Cover Page</p>
                    <p className='justify-self-end'>i</p>

                    <p className='font-bold cursor-pointer'>Table of Contents</p>
                    <p className='justify-self-end'>ii</p>
                </section>
                <section className='w-full grid grid-cols-2 py-2 px-10'>
                    <h4 className='col-span-2 font-bold'>THE HOST TRAINING ESTABLISHMENT</h4>

                    <p className='pl-5 text-[0.9rem] cursor-pointer'>Location of Host Training Establishment</p>
                    <p className='justify-self-end'>XX</p>

                </section>
                
                <section className='w-full py-5 mt-2 border-t flex flex-col justify-center items-center'>
                    <h2 className='font-bold font-oasis-title text-[1.5rem]'>FOOTER</h2>
                </section> 
            </div>

            <div className='w-full p-5 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] 
            font-oasis-text'>
                <section className='w-full mt-5 mb-5 flex flex-col justify-center items-center'>
                    <h3 className='font-bold font-oasis-text'>LIST OF APPENDICES</h3>

                    <section className='w-full grid grid-cols-2 py-2 px-10 mb-10'>
                        <p className='justify-self-end col-span-2'>Page</p>
                        <p className='justify-self-end col-span-2 font-bold'>XX</p>

                        <p className='col-span-2'>Endorsement Letter</p>
                        <p className='col-span-2'>Letter of Intent (if applicable)</p>
                    </section>
                </section>
            </div>
        </>
    )
}