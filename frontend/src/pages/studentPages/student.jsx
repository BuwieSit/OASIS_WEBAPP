import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudentProfile } from "../../api/student.service";
import { getStudentDashboardHTEs } from "../../api/studentDashboard.service";
import MainScreen from '../../layouts/mainScreen';
import fallbackImg from "../../assets/fallbackImage.jpg";
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import { TutorialCard } from '../../utilities/card';
import { MobileStudentTable, StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';
import SearchBar from '../../components/searchBar';
import { ArrowRight, Hand } from 'lucide-react';
import { ViewModal, SetupProfileModal } from '../../components/popupModal';
import filePdf from "../../assets/resume.pdf";
import api from "../../api/axios";
import { useLoading } from '../../context/LoadingContext';
import { getYouTubeThumbnail } from "../../utils/media";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Student() {
    const { setLoading } = useLoading();
    const [user, setUser] = useState(null); 
    const [profile, setProfile] = useState(null);
    const [search, setSearch] = useState("");
    
    const [openView, setOpenView] = useState(false);
    const [modalType, setModalType] = useState("video"); // "video" or "document"
    const [activeFile, setActiveFile] = useState(null);
    const [activeFileName, setActiveFileName] = useState("HTE_MOA.pdf");
    const [showSetupModal, setShowSetupModal] = useState(false);

    // Tutorial vids
    const [videoLink, setVideoLink] = useState();
    const [videoTitle, setVideoTitle] = useState("What is OASIS?");

    const tutorials = [
        {
            title: "Setting up profile",
            link: "https://www.youtube.com/embed/_tr-IpOOz00",
            desc: "Keep your student information up-to-date to ensure seamless communication and tracking."
        },
        {
            title: "Submitting MOA Prospects",
            link: "https://www.youtube.com/embed/Nna3i4K7aA8",
            desc: "Learn the step-by-step process of submitting your host establishment prospects for approval."
        },
        {
            title: "Navigating the HTE Directory",
            link: "https://www.youtube.com/embed/uCMeqEuT0R0",
            desc: "Explore and filter through our extensive list of partnered host training establishments."
        },
        {
            title: "Submitting an HTE Review",
            link: "https://www.youtube.com/embed/eEemHCKVMV0",
            desc: "Submit an HTE Review and rating to be approved by the administrator. You can also submit anonymously, your name will not be shown."
        },
        {
            title: "Browsing notifications",
            link: "https://www.youtube.com/embed/MmJHKMoEXUM",
            desc: "Receive notifications about MOA Submission updates, or announcements. Filter through notifications or save important ones."
        },
        {
            title: "Consulting with ORBI",
            link: "https://www.youtube.com/embed/HBVqo1p9Uv4",
            desc: "Get instant answers to your OJT-related questions using our intelligent AI assistant, ORBI."
        }
    ];

    // TanStack Query for Student Profile
    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: getStudentProfile,
    });

    // Sync profile data to state (if needed for other logic)
    useEffect(() => {
        if (profileData) {
            setUser(profileData.user);
            setProfile(profileData.profile);
            if (!profileData.profile || !profileData.profile.first_name) {
                setShowSetupModal(true);
            }
        }
    }, [profileData]);

    // TanStack Query for Dashboard HTEs
    const { data: htesData, isLoading: isHtesLoading } = useQuery({
        queryKey: ['studentDashboardHTEs'],
        queryFn: getStudentDashboardHTEs,
    });

    const tableData = useMemo(() => {
        if (!htesData || !Array.isArray(htesData)) return [];
        
        // Deduplicate by ID
        const seen = new Set();
        const uniqueHtes = htesData.filter(hte => {
            if (seen.has(hte.id)) return false;
            seen.add(hte.id);
            return true;
        });

        return uniqueHtes.map(hte => ({
            id: hte.id,
            hteName: hte.company_name || hte.name,
            industry: hte.industry,
            signedDate: hte.moa_signed_at || "—",
            expiryDate: hte.moa_expiry_date || "—",
            moaStatus: !hte.moa_expiry_date ? "Not Available" : hte.moa_status,
            document_path: hte.moa_file_path
        }));
    }, [htesData]);

    const filteredHtes = useMemo(() => {
        return tableData.filter((hte) =>
            hte.hteName.toLowerCase().includes(search.toLowerCase()) ||
            hte.industry.toLowerCase().includes(search.toLowerCase())
        );
    }, [tableData, search]);

    // Global loading state sync
    useEffect(() => {
        setLoading(isProfileLoading || isHtesLoading);
    }, [isProfileLoading, isHtesLoading, setLoading]);

    useEffect(() => {
        return () => {
            if (activeFile && activeFile.startsWith("blob:")) {
                window.URL.revokeObjectURL(activeFile);
            }
        };
    }, [activeFile]);
    
    const buildFileUrl = (filePath) => {
        if (!filePath) return null;

        let path = String(filePath).trim();
        if (path.startsWith("/")) path = path.slice(1);
        if (path.startsWith("uploads/")) path = path.replace("uploads/", "");

        return `${API_BASE}/uploads/${path}`;
    };

    const fetchMoaBlobUrl = async (row) => {
        if (!row?.id) return null;

        try {
            const res = await api.get(`/api/student/htes/${row.id}/moa`, {
                responseType: "blob"
            });

            const blob = res?.data;

            if (!blob || blob.size === 0) {
                console.error("No blob returned for MOA:", row.id);
                return null;
            }

            return window.URL.createObjectURL(blob);
        } catch (err) {
            console.error("MOA file fetch failed:", err?.response?.data || err.message || err);
            return null;
        }
    };

    const openPdf = async (row) => {
        const blobUrl = await fetchMoaBlobUrl(row);
        if (!blobUrl) return;

        if (activeFile && activeFile.startsWith("blob:")) {
            window.URL.revokeObjectURL(activeFile);
        }

        const safeName = (row.hteName || "HTE")
            .replace(/\s+/g, "_")
            .replace(/[^\w\-]/g, "");

        setActiveFileName(`${safeName}_MOA.pdf`);
        setActiveFile(blobUrl);
        setModalType("document");
        setOpenView(true);
    };

    const downloadMoa = async (row) => {
        if (!row?.id) return;

        try {
            const res = await api.get(`/api/student/htes/${row.id}/moa?download=1`, {
                responseType: "blob"
            });

            const blob = res?.data;

            if (!blob || blob.size === 0) {
                console.error("No blob returned for download:", row.id);
                return;
            }

            const safeName = (row.hteName || "HTE")
                .replace(/\s+/g, "_")
                .replace(/[^\w\-]/g, "");

            const filename = `${safeName}_MOA.pdf`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download MOA failed:", err?.response?.data || err.message || err);
        }
    };

    const columns = [
        {header: "HTE Name", render: row => <Text text={row.hteName}/>},
        {header: "Nature of Business", render: row => <Text text={row.industry}/>},
        {header: "MOA Signed Date", render: row => <Text text={row.signedDate}/>},
        {header: "MOA Expiration", render: row => <Text text={row.expiryDate}/>},
        {header: "MOA Status", render: row => <StatusView value={row.moaStatus}/>},
        {
            header: "MOA File",
            render: row => {
                const url = buildFileUrl(row.document_path);

                return url ? (
                    <ViewMoaButton
                        url="#"
                        onClick={(e) => {
                            e?.stopPropagation?.();
                            openPdf(row);
                        }}
                        onDownload={(e) => {
                            e?.stopPropagation?.();
                            downloadMoa(row);
                        }}
                    />
                ) : (
                    <Text text="—" />
                );
            }
        }
    ]
    
    const handleDownloadMOA = async (hteId) => {
        // This function is kept but use the new downloadMoa for table actions
        try {
            const res = await api.get(`/api/student/htes/${hteId}/moa`, { responseType: 'blob' });

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

    const setHte = (hteId) => {
        navigate(`/hte-profile?hteId=${hteId}`);
    };

    const userName = profile?.first_name || user?.email?.split('@')[0] || "Student";
    
    return(
        <>
            <MainScreen hasTopMargin={false}>
                <div className="mt-20"/>
                <ViewModal 
                    visible={openView}
                    onClose={() => {
                        if (activeFile && activeFile.startsWith("blob:")) {
                            window.URL.revokeObjectURL(activeFile);
                        }

                        setOpenView(false);
                        setActiveFile(null);
                    }}
                    isVideo={modalType === "video"}
                    isDocument={modalType === "document"}
                    file={modalType === "video" ? filePdf : activeFile}
                    filename={activeFileName}
                    videoLink={videoLink}
                    resourceTitle={modalType === "video" ? videoTitle : (activeFileName || "MOA File")}
                />

                <SetupProfileModal 
                    visible={showSetupModal}
                    onGoToProfile={() => navigate("/student-profile")}
                />

                <div className="w-full py-10 md:py-30 lg:py-30 overflow-hidden relative flex flex-col items-center justify-center bg-black/40">

                    {/* Background Image */}
                    <img 
                        src={fallbackImg} 
                        className='absolute w-full h-full object-cover bg-center bg-no-repeat opacity-45'
                        alt="Background"
                    />

                    {/* Badge */}
                    <div className="mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 z-10">
                        <span className="italic text-[#2d5f5d] text-xs sm:text-sm md:text-base flex gap-3">
                            Welcome, {userName}! <Hand/> 
                        </span>
                    </div>

                    {/* Main Headline */}
                    <section className='w-full flex flex-col justify-center items-center px-10 z-10'>
                        <h1 className='text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-oasis-text font-bold text-white text-center leading-tight drop-shadow-[3px_3px_8px_rgba(255,255,255,0.5)]'>
                            Streamline Your OJT with
                            <span className="text-oasis-header drop-shadow-[3px_3px_8px_rgba(43,98,89,0.5)]"> OASIS.</span>
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
                        <Subtitle isCenter isItalic size={'text-[0.9rem]'} text="See the latest HTEs with updates regarding their MOA status!"/>
                    </section>

                    {/* TABLE HERE */}
                    <section className="w-[90%] flex flex-col gap-5 justify-center items-center">
                        <div className='w-full flex flex-row justify-end items-center z-70'>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>
                        <StudentTable columns={columns} data={filteredHtes} onRowClick={(id) => setHte(id)}/>
                        <MobileStudentTable
                            columns={columns}
                            data={filteredHtes}
                            onRowClick={(id) => setHte(id)}
                        />
                    </section>
                    

                    <section className='w-[50%] flex flex-col gap-2 mt-10'>
                        <Title text="What is OASIS?"/>
                        <Subtitle isCenter={true} size={'text-[0.9rem]'} text="OJT Administration Support, and Information System is your all-in-one platform for managing OJT requirements, announcements, and host establishment information. Explore the cards below to learn more!"/>
                    </section>
                   

                    <div className="w-[80%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-10 pb-10 justify-center place-items-center">
                        {tutorials.map((tutorial, index) => (
                            <TutorialCard 
                                key={index}
                                title={tutorial.title}
                                desc={tutorial.desc}
                                thumbnail={getYouTubeThumbnail(tutorial.link)}
                                onClick={() => { 
                                    setVideoTitle(tutorial.title);
                                    setVideoLink(tutorial.link);
                                    setModalType("video"); 
                                    setOpenView(true); 
                                }}
                            />
                        ))}
                    </div>

                </div>
            </MainScreen>          
        </>
    )
}