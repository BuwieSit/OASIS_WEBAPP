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
import { LowerWave, UpperWave } from '../../utilities/waves';
import { StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';
import { useEffect, useState } from "react";
import { fetchHTEs, downloadMOA } from "../../api/student.service";
import SearchBar from '../../components/searchBar';

export default function HteDirectory() {
    
    const [htes, setHtes] = useState([]);
    const [search, setSearch] = useState("");
    const [industry, setIndustry] = useState("");
    const [course, setCourse] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        fetchHTEs({
            search,
            industry,
            course,
            location
        })
            .then((data) => {
                const mapped = data.map(hte => ({
                    id: hte.id,
                    hteName: hte.company_name,
                    industry: hte.industry,
                    location: hte.address,
                    description: hte.description,
                    website: hte.website,
                    moaStatus: hte.moa_status,
                    validity: hte.moa_expiry_date,
                    thumbnail: hte.thumbnail_path
                        ? `${import.meta.env.VITE_API_URL}/${hte.thumbnail_path}`
                        : fallbackImg,
                    moaUrl: hte.moa_file_path
                        ? `${import.meta.env.VITE_API_URL}/api/student/htes/${hte.id}/moa`
                        : null
                }));
                setHtes(mapped);
            })
            .catch(err => {
                console.error("Failed to load HTE directory", err);
            });
    }, [search, industry, course, location]);

    const columns = [
        { header: "HTE Name", render: row => <Text text={row.hteName}/> },
        { header: "Nature of Business", render: row => <Text text={row.industry}/> },
        { header: "MOA Expiration", render: row => <Text text={row.validity || "—"}/> },
        { header: "MOA Status", render: row => <StatusView value={row.moaStatus}/> },
        {
            header: "MOA File",
            render: row => (
                <ViewMoaButton
                    onClick={() => handleDownloadMOA(row.id)}
                />
            )
        }
    ];

    const handleDownloadMOA = async (hteId) => {
        try {
            const res = await downloadMOA(hteId);

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `HTE_${hteId}_MOA.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download MOA", err);
        }
    };

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeHteId = searchParams.get("hteId");

    useEffect(() => {
        if (activeHteId) {
            navigate(`/hte-profile?hteId=${activeHteId}`);
        }
    }, [activeHteId, navigate]);

    const setHte = (hteId) => {
        setSearchParams({ hteId });
    };

    const OPTIONS = { loop: true }
    const slides = htes.map(hte => ({
        id: hte.id,
        thumbnail: hte.thumbnail,
        hteName: hte.hteName,
        hteAddress: hte.location
    }));

    return (
        <>
            <MainScreen>
                <div className="flex flex-col justify-center items-center gap-10 w-full">

                    <div className='w-full flex flex-col items-center mb-10'>
                        <Title text={"HTE Directory"} size="text-[3rem]"/>
                        <Subtitle size={"text-[1rem]"} color={"text-oasis-button-dark"} text={"See the lists of HTEs with their MOA and significant details; See the reviews about HTEs and make a review yourself!"}/>
                    </div>

                    {/* VINCENT - LINK TO HTE PROFILE BAWAT SLIDE ITEM */}
                    <Title text={"Overview of Host Training Establishment"}/>
                    <section className="w-[90%] flex flex-col gap-5 justify-center items-center">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                        />
                        <EmblaCarousel options={OPTIONS} slides={slides} onSelectHte={setHte}/>
                    </section>

                    
                    
                    <section className="w-full flex flex-col gap-5 justify-center items-center">
                        <Title text={"List of available HTE with MOA"}/>
                        {/* TABLE HERE */}
                        <StudentTable columns={columns} data={htes} />
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