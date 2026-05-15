import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import Subtitle from '../../utilities/subtitle.jsx';
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GeneralPopupModal, ProgressModal, ViewModal } from '../../components/popupModal.jsx';
import HteDetailModal from '../../components/HteDetailModal.jsx';
import SearchBar from '../../components/searchBar.jsx';
import api from "../../api/axios";
import { AdminAPI } from "../../api/admin.api";

// Sub-components
import HteManaging from './hte_management/HteManaging.jsx';
import ProspectsManaging from './hte_management/ProspectsManaging.jsx';
import ReviewsModeration from './hte_management/ReviewsModeration.jsx';

const API_BASE = api.defaults.baseURL;

export default function HteManagement() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // TAB SYSTEM
    const activeTab = searchParams.get("tab") || "hte";

    const [search, setSearch] = useState("");
    const [selectedHte, setSelectedHte] = useState(null);
    const [popup, setPopup] = useState(null);

    // PDF VIEWING STATE
    const [openView, setOpenView] = useState(false);
    const [filePdf, setFilePdf] = useState(null);
    const [currentFileName, setCurrentFileName] = useState("HTE_MOA.pdf");
    const [viewingId, setViewingId] = useState(null);

    // Processing State
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingTitle, setProcessingTitle] = useState("");
    const [abortController, setAbortController] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // =============================
    // PDF LOGIC (Centralized)
    // =============================
    const fetchMoaBlobUrl = async (id) => {
        try {
            const res = await AdminAPI.getMoaFileBlob(id);
            const blob = res?.data;
            if (!blob || blob.size === 0) return null;
            return window.URL.createObjectURL(blob);
        } catch (err) {
            console.error("Blob fetch failed", err);
            return null;
        }
    };

    const openPdf = async (id, companyName, filePath = null) => {
        try {
            setViewingId(id);
            let url = null;
            if (filePath && filePath !== '—' && filePath !== "") {
                const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
                const separator = API_BASE.endsWith('/') ? '' : '/';
                url = filePath.startsWith("http") ? filePath : `${API_BASE}${separator}${cleanPath}`;
            } else if (id) {
                url = await fetchMoaBlobUrl(id);
            }

            if (!url) return;

            if (filePdf && filePdf.startsWith("blob:")) {
                window.URL.revokeObjectURL(filePdf);
            }

            const safeName = (companyName || "HTE").replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
            setCurrentFileName(`${safeName}_MOA.pdf`);
            setFilePdf(url);
            setOpenView(true);
        } finally {
            setViewingId(null);
        }
    };

    const downloadMoa = async (id, companyName, filePath = null) => {
        try {
            let url = null;
            let isBlob = false;
            if (filePath && filePath !== '—' && filePath !== "") {
                const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
                const separator = API_BASE.endsWith('/') ? '' : '/';
                url = filePath.startsWith("http") ? filePath : `${API_BASE}${separator}${cleanPath}`;
            } else if (id) {
                const res = await AdminAPI.getMoaFileBlob(id);
                const blob = res?.data;
                if (!blob || blob.size === 0 || blob.type === "application/json") return;
                url = window.URL.createObjectURL(blob);
                isBlob = true;
            }

            if (!url) return;
            const safeName = (companyName || "HTE").replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
            const link = document.createElement("a");
            link.href = url;
            link.download = `${safeName}_MOA.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (isBlob) window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    return (
        <AdminScreen>
            <ViewModal visible={openView} onClose={() => { setOpenView(false); setFilePdf(null); }} isDocument file={filePdf} filename={currentFileName} />
            {popup && <GeneralPopupModal title={popup.title} text={popup.text} onClose={() => setPopup(null)} isSuccess={popup.type === "success"} isFailed={popup.type === "failed"} icon={popup.icon} />}
            <HteDetailModal visible={!!selectedHte} hte={selectedHte} onClose={() => setSelectedHte(null)} />
            <ProgressModal visible={isProcessing} progress={progress} title={processingTitle} onCancel={() => abortController?.abort()} />

            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="HTE Management" size='text-[2rem]'/>
                <Subtitle text={"Centralized management for HTEs, MOA Overview, and Prospect Submissions."}/>
            </div>

            <div className='flex flex-row justify-between items-center gap-3 w-[90%] mt-5'>
                <div className='flex gap-3'>
                    {["hte", "prospects", "reviews"].map(t => (
                        <Subtitle 
                            key={t}
                            text={t === "hte" ? "HTE Management" : t === "prospects" ? "MOA Prospects" : "Reviews Moderation"}
                            onClick={() => setSearchParams({ tab: t })}
                            isActive={activeTab === t}
                            isLink weight="font-bold" size="text-[1rem]" className="rounded-2xl"
                        />
                    ))}
                </div>
                <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="w-full flex items-center justify-center mt-5">
                {activeTab === "hte" && (
                    <HteManaging 
                        search={search} 
                        setPopup={setPopup} 
                        openPdf={openPdf} 
                        downloadMoa={downloadMoa} 
                        viewingId={viewingId} 
                        onRowClick={setSelectedHte}
                        setIsProcessing={setIsProcessing}
                        setProcessingTitle={setProcessingTitle}
                        setIsDownloading={setIsDownloading}
                        setIsUploading={setIsUploading}
                    />
                )}
                {activeTab === "prospects" && (
                    <ProspectsManaging 
                        search={search} 
                        setPopup={setPopup} 
                        openPdf={openPdf} 
                        downloadMoa={downloadMoa} 
                        viewingId={viewingId} 
                        onRowClick={setSelectedHte}
                    />
                )}
                {activeTab === "reviews" && (
                    <ReviewsModeration />
                )}
            </div>
        </AdminScreen>
    );
}
