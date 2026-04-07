import MainScreen from '../../layouts/mainScreen'
import Title from '../../utilities/title'
import fallbackImg from "../../assets/fallbackImage.jpg"
import Subtitle from '../../utilities/subtitle';
import EmblaCarousel from '../../components/EmblaCarousel';
import "../../embla.css";
import { Filter } from '../../components/adminComps'
import ReviewRatings from '../../components/reviewRatings'
import AverageRating from '../../components/averageRating'
import { AddReviewCard, ReviewCard } from '../../utilities/card'
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LowerWave, UpperWave } from '../../components/waves';
import { MobileStudentTable, StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';
import { useEffect, useState } from "react";
import { fetchHTEs, downloadMOA } from "../../api/student.service";
import SearchBar from '../../components/searchBar';
import { FilterIcon, FilterX, Star} from 'lucide-react';
import { SortByStarButton } from './hteProfile';
import { Dropdown } from '../../components/adminComps';


export default function HteDirectory() {
    const [htes, setHtes] = useState([]);
    const [industry] = useState("");
    const [course] = useState("");
    const [location] = useState("");
    const [search, setSearch] = useState("");

    const filteredHtes = htes.filter((hte) =>
        hte.hteName.toLowerCase().includes(search.toLowerCase()) ||
        hte.industry.toLowerCase().includes(search.toLowerCase())
    );
    
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
                    
                    <div className="w-full flex flex-col items-center mb-10 px-4 text-center">
                        <Title 
                            text={"HTE Directory"} 
                            size="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                        />
                        <Subtitle
                            size="text-xs sm:text-sm md:text-base"
                            color="text-oasis-button-dark"
                            text="See the lists of HTEs with their MOA and significant details; See the reviews about HTEs and make a review yourself!"
                            isCenter
                            isItalic
                        />
                    </div>

                    {/* VINCENT - LINK TO HTE PROFILE BAWAT SLIDE ITEM */}
                    <Title 
                        text={"Overview of Host Training Establishment"} 
                        size="text-[1rem] sm:text-[1rem] md:text-[1.3rem] lg:text-[1.5rem]"
                    />
                 
                    <section className="w-[90%] flex flex-col gap-5 justify-center items-center">
                        <div className='w-full flex flex-row justify-end items-center z-70'>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>
                        <EmblaCarousel options={OPTIONS} slides={slides} onSelectHte={setHte}/>
                    </section>

                
                    <section className="w-full flex flex-col gap-5 justify-center items-center">
                        <Title text={"List of available HTE with MOA"}/>
                        
                        {filteredHtes.length > 0 ? (
                            <>
                                {/* DESKTOP TABLE */}
                                <StudentTable 
                                    columns={columns} 
                                    data={filteredHtes} 
                                    onRowClick={(id) => setHte(id)} 
                                />

                                {/* MOBILE TABLE - Now using filteredHtes */}
                                <MobileStudentTable
                                    columns={columns}
                                    data={filteredHtes}
                                    onRowClick={(id) => setHte(id)}
                                />
                            </>
                        ) : (
                            /* NO RESULTS UI */
                            <div className='w-full flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl'>
                                <Subtitle 
                                    text={search ? `No HTEs found matching "${search}"` : "The directory is currently empty."} 
                                    color={"text-oasis-gray"}
                                />
                                {search && (
                                    <button 
                                        onClick={() => setSearch("")}
                                        className="text-oasis-header underline text-sm mt-3 font-bold cursor-pointer hover:text-oasis-button-dark transition-colors"
                                    >
                                        Clear search and show all
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

{/* REVIEWS SECTION */}
                    {/* <div>
                        <section className="w-full flex flex-col gap-6 justify-center items-center px-4 py-8">

                            <Title text={"Student Reviews"} />

                      
                            <section className="w-full flex justify-start">
                                <div className="w-full max-w-[900px] mx-auto">
                                    <Filter text={"Filters"} />
                                </div>
                            </section>

                            <section className="w-full flex flex-col md:flex-row justify-center items-center gap-8 p-5">

                                <ReviewRatings />
                                <AverageRating />

                            </section>

             
                            <section className="w-full flex flex-col lg:flex-row justify-center items-start gap-6 p-4">

              
                                <section className="
                                    w-full
                                    max-h-[420px]
                                    overflow-y-auto
                                    p-4
                                    flex flex-wrap
                                    gap-4
                                    rounded-3xl
                                    justify-center
                                    lg:w-[60%]
                                ">
                                    <ReviewCard />
                                    <ReviewCard />
                                    <ReviewCard />
                                    <ReviewCard />
                                </section>

                            
                                <div className="w-full lg:w-[35%] flex justify-center">
                                    <AddReviewCard />
                                </div>

                            </section>
                        </section>
                        
  
                    </div> */}

                    

                </div>
                
            </MainScreen>
        </>
    )
}