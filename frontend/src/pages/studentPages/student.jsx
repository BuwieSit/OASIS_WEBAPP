import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getStudentDashboardHTEs } from "../../api/studentDashboard.service";
import MainScreen from '../../layouts/mainScreen';
import fallbackImg from "../../assets/fallbackImage.jpg";
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import { TutorialCard } from '../../utilities/card';
import { MobileStudentTable, StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';
import SearchBar from '../../components/searchBar';
import { ArrowRight } from 'lucide-react';
import { ViewModal } from '../../components/popupModal';
import filePdf from "../../assets/resume.pdf";
import api from "../../api/axios";

export default function Student() {

    const [tableData, setTableData] = useState([]);
    const [user, setUser] = useState(null); 
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const filteredHtes = tableData.filter((hte) =>
        hte.hteName.toLowerCase().includes(search.toLowerCase()) ||
        hte.industry.toLowerCase().includes(search.toLowerCase())
    );
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await api.get("/api/student/me");
                setUser(res.data.user);
                setProfile(res.data.profile); 
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        getStudentDashboardHTEs({ search })
            .then((htes) => {
                const mappedData = htes.map(hte => ({
                    id: hte.id,
                    hteName: hte.name,
                    industry: hte.industry,
                    signedDate: hte.moa_signed_at || "—",
                    expiryDate: hte.moa_expiry_date || "—",
                    moaStatus: hte.moa_status,
                    moaUrl: hte.moa_file
                        ? `${import.meta.env.VITE_API_URL}/api/student/htes/${hte.id}/moa`
                        : null
                }));

                setTableData(mappedData);
            })
            .catch((err) => {
                console.error("Failed to load HTE dashboard data", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [search]);
    
    const columns = [
        {header: "HTE Name", render: row => <Text text={row.hteName}/>},
        {header: "Nature of Business", render: row => <Text text={row.industry}/>},
        {header: "MOA Signed Date", render: row => <Text text={row.signedDate}/>},
        {header: "MOA Expiration", render: row => <Text text={row.expiryDate}/>},
        {header: "MOA Status", render: row => <StatusView value={row.moaStatus}/>},
        {
            header: "MOA File",
            render: row => (
                <ViewMoaButton
                    onClick={() => handleDownloadMOA(row.id)}
                />
            )
        }
    ]
    
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

    const [openView, setOpenView] = useState(false);
    const userName = profile?.first_name || user?.email?.split('@')[0] || "Student";
    
    return(
        <>
            <MainScreen hasTopMargin={true}>
                
                <ViewModal 
                    visible={openView}
                    onClose={() => setOpenView(false)}
                    isVideo={true}
                    file={filePdf}
                    resourceTitle="What is OASIS?"
                />

                <div className="w-full py-10 md:py-30 lg:py-30 overflow-hidden relative flex flex-col items-center justify-center">

                    {/* Background Image */}
                    <img 
                        src={fallbackImg} 
                        className='absolute w-full h-full object-cover bg-center bg-no-repeat opacity-45'
                        alt="Background"
                    />

                    {/* Badge */}
                    <div className="mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 z-10">
                        <span className="italic text-[#2d5f5d] text-xs sm:text-sm md:text-base">
                            👋 Welcome, {userName}!
                        </span>
                    </div>

                    {/* Main Headline */}
                    <section className='w-full flex flex-col justify-center items-center px-10 z-10'>
                        <h1 className='text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-oasis-text font-bold text-white text-center leading-tight drop-shadow-[3px_3px_8px_rgba(0,0,0,0.8)]'>
                            Streamline Your OJT with
                            <span className="text-oasis-header "> OASIS.</span>
                        </h1>
                        
                        <p className='text-[0.6rem] sm:text-[0.6rem] md:text-[1rem] lg:text-[1.3rem] font-oasis-text text-white text-center leading-tight drop-shadow-[3px_3px_8px_rgba(0,0,0,0.8)]'>
                            Submit MOA prospects, consult ORBI for OJT inquiries, and access the centralized MOA database.
                            <br />
                            <span className>Tulay sa oportunidad, gabay sa kinabukasan.</span>
                        </p>
                    </section>
                     
                    {/* CTA Button */}
                    <a href="#prospectForm" className="z-10">
                        <button className='mt-8 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl text-center bg-[#2d5f5d] text-white font-bold font-oasis-text cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)] duration-200 transition ease-in-out hover:scale-105 hover:bg-[#234948] text-sm md:text-base lg:text-lg flex items-center gap-2'>
                            Submit MOA Prospect
                            <ArrowRight size={20} />
                        </button>
                    </a>

                </div>
                   
                {/* 2ND SECTION */}
                <div className='w-full min-h-150 mt-20 h-auto pb-5 pt-5 flex flex-wrap flex-col items-center justify-center gap-10'>

                    <section className='w-[50%] flex flex-col gap-2'>
                        <Title text="HTE Dashboard Updates"/>
                        <Subtitle isCenter={true} size={'text-[0.9rem]'} text="See the latest HTEs with updates regarding their MOA status!"/>
                    </section>

                    {/* TABLE HERE */}
                    <StudentTable columns={columns} data={filteredHtes} onRowClick={(id) => setHte(id)}>
                        <div className='w-full flex flex-row justify-between items-center'>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>
                    </StudentTable>
                    <MobileStudentTable
                        columns={columns}
                        data={tableData}
                        onRowClick={(id) => setHte(id)}
                    />

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
                {/* <LowerWave/> */}


            </MainScreen>          
        </>
    )
}