import MainScreen from '../../layouts/mainScreen'
import Title from '../../utilities/title'
import ctaBg from "../../assets/ctaBg.png"
import fallbackImg from "../../assets/fallbackImage.jpg"
import Subtitle from '../../utilities/subtitle';
import EmblaCarousel from '../../components/EmblaCarousel';
import "../../embla.css";
import { Filter } from '../../components/adminComps'
import ReviewRatings from '../../components/reviewRatings'
import AverageRating from '../../components/averageRating'
import { AddReviewCard, ReviewCard } from '../../utilities/card'
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LowerWave, UpperWave } from '../../utilities/waves';
import { StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';

export default function HteDirectory() {
    
    // MOCK DATA
    const tableData = [
        {
            id: 1,
            hteName: "PrimaTech",
            industry: "IT",
            signedDate: "January 20, 2026",
            expiryDate: "January 20, 2029",
            moaStatus: "Rejected",
            moaUrl: "www.facebook.com",
        },

        {
            id: 2,
            hteName: "PrimaTech",
            industry: "IT",
            signedDate: "January 20, 2026",
            expiryDate: "January 20, 2029",
            moaStatus: "Active",
            moaUrl: "www.youtube.com",

        }
    ]

    const columns = [
        {header: "HTE Name", render: row => <Text text={row.hteName}/>},
        {header: "Industry", render: row => <Text text={row.industry}/>},
        {header: "MOA Signed Date", render: row => <Text text={row.signedDate}/>},
        {header: "MOA Expiration", render: row => <Text text={row.expiryDate}/>},
        {header: "MOA Status", render: row => <StatusView value={row.moaStatus}/>},
        {header: "MOA File", render: row => <ViewMoaButton url={row.moaUrl}/>}
    ]

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeHte = searchParams.get("hte");

    useEffect(() => {
        if (activeHte) {
            navigate(`/hte-profile?hte=${encodeURIComponent(activeHte)}`)
        }
    }, [activeHte, navigate])

    const setHte = (hteName) => {
        setSearchParams({ hte: hteName });
    };



    // MOCK DATA
    const OPTIONS = { loop: true }
    const SLIDES = [
        {
            thumbnail: fallbackImg,
            hteName: "ABC Corporation",
            hteAddress: "Quezon City"
        },
        {
            thumbnail: fallbackImg,
            hteName: "XYZ Industries",
            hteAddress: "Makati City"
        },
        {
            thumbnail: fallbackImg,
            hteName: "TechNova",
            hteAddress: "Pasig City"
        },
        {
            thumbnail: fallbackImg,
            hteName: "Google",
            hteAddress: "BGC"
        },
        {
            thumbnail: fallbackImg,
            hteName: "IBM",
            hteAddress: "Navotas City"
        },
    ];


    return (
        <>
            <MainScreen>
                <div className="flex flex-col justify-center items-center gap-10 w-full">

                    <div className='w-full flex flex-col items-center mb-10'>
                        <Title text={"HTE Directory"} size="text-[3rem]"/>
                        <Subtitle size={"text-[1rem]"} color={"text-oasis-button-dark"} text={"See the lists of HTEs with their MOA and significant details; See the reviews about HTEs and make a review yourself!"}/>
                    </div>

                    {/* VINCENT - LINK TO HTE PROFILE BAWAT SLIDE ITEM */}
                    <section className="w-full flex flex-col gap-5 justify-center items-center">
                        <Title text={"Overview of Host Training Establishment"}/>
                        <EmblaCarousel options={OPTIONS} slides={SLIDES} onSelectHte={setHte}/>
                    </section>
                    
                    
                    <section className="w-full flex flex-col gap-5 justify-center items-center">
                        <Title text={"List of available HTE with MOA"}/>
                        {/* TABLE HERE */}
                        <StudentTable columns={columns} data={tableData}>

                        </StudentTable>
                    </section>

{/* REVIEWS SECTION */}
                    <div>
                        <UpperWave/>
                        <section className="bg-oasis-blue w-full flex flex-col gap-5 justify-center items-center">
                            <Title text={"Student Reviews"}/>

                            <section className='w-[80%] flex justify-start items-center'>
                                <Filter text={"Filters"}/>
                            </section>

                            <section className="w-full p-5 flex flex-row justify-evenly items-center">
                                <ReviewRatings/>
                                <AverageRating/>
                            </section>

                            <section className="w-full p-5 flex justify-evenly items-center relative">
                                <section className="w-[50%] max-h-100 overflow-y-auto p-5 flex flex-wrap gap-4 rounded-3xl ">
                                    <ReviewCard/>
                                    <ReviewCard/>
                                    <ReviewCard/>
                                    <ReviewCard/>
            
                                </section>
                                
                                <AddReviewCard />
                            </section>
                            

                        </section>
                        <LowerWave/>
                    </div>
                    
                </div>
                
            </MainScreen>
        </>
    )
}