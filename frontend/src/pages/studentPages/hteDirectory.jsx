import MainScreen from '../../layouts/mainScreen'
import Title from '../../utilities/title'
import fallbackImg from "../../assets/fallbackImage.jpg"
import Subtitle from '../../utilities/subtitle';
import EmblaCarousel from '../../components/EmblaCarousel';
import "../../embla.css";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MobileStudentTable, StudentTable } from '../../components/oasisTable';
import { Text, StatusView, ViewMoaButton } from '../../utilities/tableUtil';
import { useEffect, useState } from "react";
import { fetchHTEs } from "../../api/student.service";
import SearchBar from '../../components/searchBar';
import { ViewModal } from '../../components/popupModal';
import api from "../../api/axios";

const API_BASE = import.meta.env.VITE_API_URL;

export default function HteDirectory() {
    const [htes, setHtes] = useState([]);
    const [industry] = useState("");
    const [course] = useState("");
    const [location] = useState("");
    const [search, setSearch] = useState("");

    const [openView, setOpenView] = useState(false);
    const [activeFile, setActiveFile] = useState(null);
    const [activeFileName, setActiveFileName] = useState("HTE_MOA.pdf");

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
                    moaStatus: !hte.moa_expiry_date ? "Not Available" : hte.moa_status,
                    validity: hte.moa_expiry_date || "—",
                    thumbnail: hte.thumbnail_path
                        ? `${API_BASE}/${hte.thumbnail_path}`
                        : fallbackImg,
                    document_path: hte.moa_file_path
                }));
                setHtes(mapped);
            })
            .catch(err => {
                console.error("Failed to load HTE directory", err);
            });
    }, [search, industry, course, location]);

    const buildFileUrl = (filePath) => {
        if (!filePath) return null;
        let path = String(filePath).trim();
        if (path.startsWith("/")) path = path.slice(1);
        if (path.startsWith("uploads/")) path = path.replace("uploads/", "");
        return `${API_BASE}/uploads/${path}`;
    };

    const openPdf = (filePath, fileName = "HTE_MOA.pdf") => {
        const url = buildFileUrl(filePath);
        if (!url) return;

        setActiveFile(url);
        setActiveFileName(fileName);
        setOpenView(true);
    };

    const downloadMoa = async (filePath, companyName) => {
        const url = buildFileUrl(filePath);
        if (!url) return;

        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const safeName = (companyName || "HTE")
                .replace(/\s+/g, "_")
                .replace(/[^\w\-]/g, "");
            const filename = `${safeName}_MOA.pdf`;

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download MOA failed:", err);
        }
    };

    const columns = [
        { header: "HTE Name", render: row => <Text text={row.hteName}/> },
        { header: "Nature of Business", render: row => <Text text={row.industry}/> },
        { header: "MOA Expiration", render: row => <Text text={row.validity}/> },
        { header: "MOA Status", render: row => <StatusView value={row.moaStatus}/> },
        {
            header: "MOA File",
            render: row => {
                const url = buildFileUrl(row.document_path);
                return url ? (
                    <ViewMoaButton
                        url={url}
                        onClick={() => openPdf(row.document_path, `${row.hteName.replace(/\s+/g, "_")}_MOA.pdf`)}
                        onDownload={() => downloadMoa(row.document_path, row.hteName)}
                    />
                ) : (
                    <Text text="—" />
                );
            }
        }
    ];

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
                <ViewModal 
                    visible={openView}
                    onClose={() => setOpenView(false)}
                    isDocument={true}
                    file={activeFile}
                    filename={activeFileName}
                    resourceTitle="MOA File"
                />
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

                
                    <section className="w-[90%] flex flex-col gap-5 justify-center items-center">
                        <Title text={"List of available HTE with MOA"}/>
                        <div className='w-full flex flex-row justify-end items-center z-70'>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>
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
                    
                </div>
            </MainScreen>
        </>
    )
}