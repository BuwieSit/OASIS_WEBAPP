import { Link } from 'react-router-dom'
import { useEffect, useState } from "react";
import { getStudentDashboardHTEs } from "../../api/studentDashboard.service";
import MainScreen from '../../layouts/mainScreen';
import fallbackImg from "../../assets/fallbackImage.jpg"
import { UpperWave, LowerWave } from '../../utilities/waves';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import { CustomCard, TutorialCard } from '../../utilities/card';
import { StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';
import SearchBar from '../../components/searchBar';
import { Filter } from '../../components/adminComps';
import { FilterIcon, ArrowRight } from 'lucide-react';
import { ViewModal } from '../../components/popupModal';
import filePdf from "../../assets/resume.pdf";
import PdfViewer from '../../utilities/pdfViewer';
import api from "../../api/axios";

export default function Student() {

    const [tableData, setTableData] = useState([]);
    const [search, setSearch] = useState("");
    const [user, setUser] = useState(null); // ✅ Fixed: Changed from userName to user
    const [profile, setProfile] = useState(null); // ✅ Added profile state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await api.get("/api/student/me");
                setUser(res.data.user);
                setProfile(res.data.profile); // ✅ Get profile data too
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

    const [openView, setOpenView] = useState(false);
    
    // ✅ Get user's name properly
    const userName = profile?.first_name || user?.email?.split('@')[0] || "Student";
    
    return(
        <>
            <MainScreen hasTopMargin={true}>
                
                <ViewModal 
                    visible={openView}
                    onClose={() => setOpenView(false)}
                    isDocument={true}
                    file={filePdf}
                    resourceTitle="Buwie Resume"
                />

                <div className="w-full aspect-video overflow-hidden relative flex flex-col items-center justify-center">

                    {/* Background Image */}
                    <img 
                        src={fallbackImg} 
                        className='absolute w-full h-full object-cover bg-center bg-no-repeat opacity-45'
                        alt="Background"
                    />

                    {/* Badge */}
                    <div className="mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 z-10">
                        <span className="text-sm font-style: italic text-[#2d5f5d]">👋 Welcome, {userName}!</span>
                    </div>

                    {/* Main Headline */}
                    <section className='w-full flex flex-col justify-center items-center px-10 z-10'>
                        <h1 className='text-5xl md:text-6xl lg:text-7xl font-oasis-text font-bold text-white text-center leading-tight drop-shadow-[3px_3px_8px_rgba(0,0,0,0.8)]'>
                            Streamline Your OJT with
                        </h1>
                        <h1 className='text-5xl md:text-6xl lg:text-9xl font-oasis-text font-bold text-center leading-tight mt-2 drop-shadow-[3px_3px_8px_rgba(255,255,255,0.9)]'>
                            <span className="text-[#2B6259] ">OASIS.</span>
                        </h1>
                        
                        <p className='text-lg md:text-xl text-white text-center mt-6 front font-oasis-text drop-shadow-[2px_2px_6px_rgba(0,0,0,0.8)]'>
                            Submit MOA prospects, consult ORBI for OJT inquiries, and access the centralized MOA database.
                            <br />
                            <span className>Tulay sa oportunidad, gabay sa kinabukasan.</span>
                        </p>
                    </section>
                     
                    {/* CTA Button */}
                    <a href="#prospectForm" className="z-10">
                        <button className='mt-8 px-8 py-4 rounded-xl text-center bg-[#2d5f5d] text-white font-bold font-oasis-text cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)] duration-200 transition ease-in-out hover:scale-105 hover:bg-[#234948] text-base md:text-lg flex items-center gap-2'>
                            Submit MOA Prospect
                            <ArrowRight size={20} />
                        </button>
                    </a>

                </div>
                   
                {/* <UpperWave/> */}
                <div className='w-full min-h-150 mt-20 h-auto pb-5 pt-5 flex flex-wrap flex-col items-center justify-center gap-10'>

                    <section className='w-[50%] flex flex-col gap-2'>
                        <Title text="HTE Dashboard Updates"/>
                        <Subtitle isCenter={true} size={'text-[0.9rem]'} text="See the latest HTEs with updates regarding their MOA status!"/>
                    </section>

                    {/* TABLE HERE */}
                    <StudentTable columns={columns} data={tableData}>
                        <div className='w-full flex flex-row justify-between items-center'>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>
                        
                    </StudentTable>

                    <section className='w-[50%] flex flex-col gap-2 mt-10'>
                        <Title text="What is OASIS?"/>
                        <Subtitle isCenter={true} size={'text-[0.9rem]'} text="OJT Administration Support, and Information System is your all-in-one platform for managing OJT requirements, announcements, and host establishment information. Explore the cards below to learn more!"/>
                    </section>
                   

                    <div className="w-[80%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-10 pb-10 justify-center place-items-center">

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