import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { Dropdown, Filter } from '../../components/adminComps.jsx';
import { Label, RatingLabel } from '../../utilities/label.jsx';
import { AnnounceButton, CoursesButton } from '../../components/button.jsx';
import Subtitle from '../../utilities/subtitle.jsx';
import { Text, HteLocation, ViewMoaButton } from '../../utilities/tableUtil.jsx';
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AdminAPI } from "../../api/admin.api";
import { Check, Download, FileCheck, Save, Upload, X, PlusCircle } from 'lucide-react';
import { ConfirmModal, GeneralPopupModal, ProgressModal, ViewModal } from '../../components/popupModal.jsx';
import HteDetailModal from '../../components/HteDetailModal.jsx';
import SearchBar from '../../components/searchBar.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../../api/axios.jsx";

const API_BASE = api.defaults.baseURL;

export default function AdmOperations() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // TAB SYSTEM
    const activeTab = searchParams.get("tab") || "hte";
    const statusFilter = searchParams.get("status");

    // =============================
    // FETCH HTEs (TanStack Query)
    // =============================
    const { data: htes = [], isLoading: htesLoading } = useQuery({
        queryKey: ['adminHtes', statusFilter],
        queryFn: () => AdminAPI.getHTEs(statusFilter),
    });

    // =============================
    // FETCH PROSPECTS (TanStack Query)
    // =============================
    const { data: prospects = [], isLoading: prospectsLoading } = useQuery({
        queryKey: ['adminMoaProspects'],
        queryFn: AdminAPI.getMoaProspects,
        enabled: activeTab === "prospects",
    });

    const hteDropdown = htes.map(h => h.company_name);

    const uploadRef = useRef(null);
    const [search, setSearch] = useState("");

    // PDF VIEWING STATE
    const [openView, setOpenView] = useState(false);
    const [filePdf, setFilePdf] = useState(null);
    const [currentFileName, setCurrentFileName] = useState("HTE_MOA.pdf");
    const [viewingId, setViewingId] = useState(null);

    // =============================
    // FILTERING LOGIC
    // =============================
    const filteredHtes = useMemo(() => {
        if (!search) return htes;
        const s = search.toLowerCase();
        return htes.filter(h => 
            h.company_name?.toLowerCase().includes(s) ||
            h.industry?.toLowerCase().includes(s) ||
            h.address?.toLowerCase().includes(s) ||
            h.contact_person?.toLowerCase().includes(s)
        );
    }, [htes, search]);

    const filteredProspects = useMemo(() => {
        if (!search) return prospects;
        const s = search.toLowerCase();
        return prospects.filter(m => 
            m.company_name?.toLowerCase().includes(s) ||
            m.industry?.toLowerCase().includes(s) ||
            m.address?.toLowerCase().includes(s) ||
            m.contact_person?.toLowerCase().includes(s) ||
            m.contact_email?.toLowerCase().includes(s) ||
            m.status?.toLowerCase().includes(s)
        );
    }, [prospects, search]);
    
    const [selectedHte, setSelectedHte] = useState(null);

    // =============================
    // FORM STATE (ADD HTE)
    // =============================
    const [companyName, setCompanyName] = useState("");
    const [companyAbout, setCompanyAbout] = useState("");
    const [companyLoc, setCompanyLoc] = useState("");
    const [statusValue, setStatusValue] = useState("ACTIVE");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactPosition, setContactPosition] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [signedAt, setSignedAt] = useState("");
    const [validity, setValidity] = useState("");
    const [eligibleCourses, setEligibleCourses] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [moaFile, setMoaFile] = useState(null);

    const [confirmClear, setConfirmClear] = useState(false);
    const [popup, setPopup] = useState(null);

    // Processing State
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingTitle, setProcessingTitle] = useState("");
    const [abortController, setAbortController] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // REVIEWS MODERATION STATE
    const [reviewStatus, setReviewStatus] = useState("PENDING");
    const [reviewCriteria, setReviewCriteria] = useState("");
    const [reviewSort, setReviewSort] = useState("newest");
    const [reviewRating, setReviewRating] = useState("");
    const [reviewHteName, setReviewHteName] = useState("");

    const reviewParams = useMemo(() => {
        const params = { status: reviewStatus, sort: reviewSort };
        if (reviewCriteria) params.criteria = reviewCriteria;
        if (reviewRating) params.rating = reviewRating;
        if (reviewHteName) params.hte_name = reviewHteName;
        return params;
    }, [reviewStatus, reviewSort, reviewCriteria, reviewRating, reviewHteName]);

    const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
        queryKey: ['adminReviews', reviewParams],
        queryFn: () => AdminAPI.getReviews(reviewParams),
        enabled: activeTab === "reviews",
    });

    // =============================
    // MUTATIONS
    // =============================
    const createHteMutation = useMutation({
        mutationFn: AdminAPI.createHTE,
        onSuccess: () => {
            setPopup({ title: "Success", text: "HTE saved successfully", icon: <Check size={35}/>, type: "success" });
            queryClient.invalidateQueries({ queryKey: ['adminHtes'] });
            resetForm();
            setShowAddHte(false);
        },
        onError: () => setPopup({ title: "Error", text: "Failed to save HTE", icon: <X color="#800020" size={35}/>, type: "failed" })
    });

    const approveReviewMutation = useMutation({
        mutationFn: AdminAPI.approveReview,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
    });

    const rejectReviewMutation = useMutation({
        mutationFn: AdminAPI.rejectReview,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
    });

    const updateProspectStatusMutation = useMutation({
        mutationFn: ({ id, status }) => AdminAPI.updateMoaProspectStatus(id, status),
        onSuccess: () => {
            setPopup({ title: "Status Changed", text: "Prospect status updated.", type: "success" });
            queryClient.invalidateQueries({ queryKey: ['adminMoaProspects'] });
            queryClient.invalidateQueries({ queryKey: ['adminHtes'] });
        },
        onError: (err) => setPopup({ title: "Error", text: err?.response?.data?.message || "Failed to update prospect.", type: "failed" })
    });

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

    // =============================
    // TABLE HELPERS
    // =============================
    const getDisplayStatus = (row) => {
        const backendStatus = row?.moa?.status || row?.moa_status || "NO MOA";
        const expiry = row?.moa?.expires_at || row?.moa_expiry_date;
        if (!expiry) return backendStatus;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(expiry);
        if (Number.isNaN(expiryDate.getTime())) return backendStatus;
        expiryDate.setHours(0, 0, 0, 0);
        if (today > expiryDate) return "EXPIRED";
        return backendStatus;
    };

    const resetForm = () => {
        setCompanyName(""); setCompanyAbout(""); setCompanyLoc(""); setStatusValue("ACTIVE");
        setIndustry(""); setWebsite(""); setContactPerson(""); setContactPosition("");
        setContactNumber(""); setContactEmail(""); setSignedAt(""); setValidity("");
        setEligibleCourses([]); setLogoFile(null); setThumbnailFile(null); setMoaFile(null);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

    // =============================
    // TABLE COLUMNS
    // =============================
    const hteColumns = [
        { header: "HTE Name", render: r => <Text text={r.company_name} /> },
        { header: "Industry", render: r => <Text text={r.industry} /> },
        { header: "Contact Person", render: r => <Text text={r.contact_person || "—"} /> },
        { header: "Location", render: r => <HteLocation address={r.address} /> },
        { header: "MOA Status", render: r => <Text text={getDisplayStatus(r)} /> },
        { header: "Expiry Date", render: r => <Text text={formatDate(r.moa?.expires_at || r.moa_expiry_date)} /> },
        { header: "View MOA", render: r => (
            <ViewMoaButton 
                url={(r.moa?.file_path || r.moa_file_path || r.moa?.has_document_blob) ? "#" : null}
                loading={viewingId === (r.moa?.id || r.id)}
                onClick={() => openPdf(r.moa?.id || r.id, r.company_name, r.moa?.file_path || r.moa_file_path)}
                onDownload={() => downloadMoa(r.moa?.id || r.id, r.company_name, r.moa?.file_path || r.moa_file_path)}
            />
        )}
    ];

    const prospectStatusColors = { EMAILED_TO_HTE: "text-oasis-aqua", FOR_SIGNATURE: "text-oasis-gray", ULCO: "text-oasis-header", RETRIEVED_FROM_ULCO: "text-oasis-button-light", APPROVED: "text-green-500", CANCELLED: "text-oasis-red" };
    const prospectStatusOptions = ["EMAILED_TO_HTE", "FOR_SIGNATURE", "ULCO", "RETRIEVED_FROM_ULCO", "APPROVED", "CANCELLED"];

    const prospectColumns = [
        { header: "Status", render: r => (
            <div className='w-40'>
                <Dropdown 
                    value={r.status} 
                    currentValueColor={prospectStatusColors} 
                    onChange={(val) => updateProspectStatusMutation.mutate({ id: r.id, status: val })}
                    disabled={r.status === "APPROVED" || r.status === "CANCELLED"}
                    categories={prospectStatusOptions}
                />
            </div>
        )},
        { header: "HTE Name", render: r => <Text text={r.company_name} /> },
        { header: "Industry", render: r => <Text text={r.industry} /> },
        { header: "Contact Person", render: r => <Text text={r.contact_person} /> },
        { header: "Email", render: r => <Text text={r.contact_email} /> },
        { header: "Contact Number", render: r => <Text text={r.contact_number} /> },
        { header: "MOA File", render: r => (
            <ViewMoaButton 
                url={r.moa_file_path ? "#" : null}
                loading={viewingId === r.id}
                onClick={() => openPdf(r.id, r.company_name, r.moa_file_path)}
                onDownload={() => downloadMoa(r.id, r.company_name, r.moa_file_path)}
            />
        )}
    ];

    const handleSaveHTE = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("company_name", companyName); formData.append("description", companyAbout); formData.append("address", companyLoc); formData.append("status", statusValue);
        formData.append("industry", industry); formData.append("website", website); formData.append("contact_person", contactPerson); formData.append("contact_position", contactPosition);
        formData.append("contact_number", contactNumber); formData.append("contact_email", contactEmail);
        if (signedAt) formData.append("signed_at", signedAt); if (validity) formData.append("validity", validity);
        formData.append("eligible_courses", JSON.stringify(eligibleCourses));
        if (logoFile) formData.append("logo", logoFile); if (thumbnailFile) formData.append("thumbnail", thumbnailFile); if (moaFile) formData.append("moa_file", moaFile);
        createHteMutation.mutate(formData);
    };

    const handleDownloadHTEs = async () => {
        setIsProcessing(true); setIsDownloading(true); setProcessingTitle("Downloading HTEs...");
        try {
            const res = await AdminAPI.downloadHTEsExcel(statusFilter || "ALL");
            const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `hte_list_${statusFilter || "ALL"}.xlsx`;
            document.body.appendChild(a); a.click(); a.remove();
        } catch { setPopup({ title: "Error", text: "Download failed.", type: "failed" }); }
        finally { setIsProcessing(false); setIsDownloading(false); }
    };

    const handleUploadFile = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setIsProcessing(true); setIsUploading(true); setProcessingTitle("Uploading HTEs...");
        AdminAPI.uploadHTEsExcel(file).then((res) => {
            setPopup({ title: "Upload Completed", text: `Created: ${res.created_htes}`, type: "success" });
            queryClient.invalidateQueries({ queryKey: ['adminHtes'] });
        }).catch(() => setPopup({ title: "Upload Failed", type: "failed" }))
        .finally(() => { setIsProcessing(false); setIsUploading(false); e.target.value = ""; });
    };

    const [showAddHte, setShowAddHte] = useState(false);

    return (
        <AdminScreen>
            <ViewModal visible={openView} onClose={() => { setOpenView(false); setFilePdf(null); }} isDocument file={filePdf} filename={currentFileName} />
            {popup && <GeneralPopupModal title={popup.title} text={popup.text} onClose={() => setPopup(null)} isSuccess={popup.type === "success"} isFailed={popup.type === "failed"} />}

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

            <input ref={uploadRef} type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleUploadFile} />

            {activeTab === "hte" && (
                <div className="w-full flex flex-col items-center animate__animated animate__fadeIn">
                    <div className='flex justify-between items-center w-[90%] mb-5 border-b border-gray-200 pb-3'>
                        <Title text={"HTE Management & MOA Overview"} />
                        <div className='flex gap-3'>
                            <AnnounceButton icon={<PlusCircle size={20}/>} btnText="Add HTE" onClick={() => setShowAddHte(!showAddHte)} />
                            <AnnounceButton icon={<Upload />} btnText="Import" onClick={() => uploadRef.current.click()} />
                            <AnnounceButton icon={<Download />} btnText="Export" onClick={handleDownloadHTEs} />
                        </div>
                    </div>

                    {htesLoading ? <Subtitle text="Loading..." /> : (
                        <OasisTable columns={hteColumns} data={filteredHtes} onRowClick={setSelectedHte}>
                             <div className="flex gap-3 mb-4">
                                {["All", "Active", "Expired"].map(s => (
                                    <Filter key={s} text={s} isActive={(statusFilter || "All").toLowerCase() === s.toLowerCase()} 
                                        onClick={() => setSearchParams({ tab: "hte", status: s === "All" ? "" : s.toUpperCase() })} />
                                ))}
                            </div>
                        </OasisTable>
                    )}

                    {showAddHte && (
                        <div className="w-[90%] bg-white p-8 rounded-3xl mt-5 shadow-lg border border-gray-200 animate__animated animate__fadeInDown">
                             <form onSubmit={handleSaveHTE} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <FileUploadField labelText="HTE Logo" fieldId="logo" onChange={e => setLogoFile(e.target.files[0])} />
                                    <FileUploadField labelText="MOA File" fieldId="moa" onChange={e => setMoaFile(e.target.files[0])} />
                                    <SingleField labelText="Company Name *" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                                    <SingleField labelText="Industry *" value={industry} onChange={e => setIndustry(e.target.value)} />
                                    <MultiField labelText="About" value={companyAbout} onChange={e => setCompanyAbout(e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                    <SingleField labelText="Contact Person *" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                                    <SingleField labelText="Contact Email *" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                                    <SingleField labelText="Address *" value={companyLoc} onChange={e => setCompanyLoc(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <SingleField labelText="Notarized" fieldHolder="YYYY-MM-DD" value={signedAt} onChange={e => setSignedAt(e.target.value)} />
                                        <SingleField labelText="Validity" fieldHolder="Years" value={validity} onChange={e => setValidity(e.target.value)} />
                                    </div>
                                    <AnnounceButton type="submit" btnText="Save HTE" className="w-full" />
                                </div>
                             </form>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "prospects" && (
                <div className="w-full flex flex-col items-center animate__animated animate__fadeIn">
                    <div className='flex justify-start items-start w-[90%] mb-5 border-b border-gray-200 pb-3'>
                        <Title text={"MOA Prospect Submissions"} />
                    </div>
                    {prospectsLoading ? <Subtitle text="Loading..." /> : (
                        <OasisTable columns={prospectColumns} data={filteredProspects} onRowClick={setSelectedHte} />
                    )}
                </div>
            )}

            {activeTab === "reviews" && (
                <div className='w-[90%] flex flex-col items-center animate__animated animate__fadeIn'>
                     <div className='flex justify-start items-start w-full mb-5 border-b border-gray-200 pb-3'>
                        <Title text={"Reviews Moderation"} />
                    </div>
                    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                            {reviewsLoading ? <Subtitle text="Loading..." /> : reviews.length === 0 ? <Subtitle text="No reviews found." /> : reviews.map(r => (
                                <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Subtitle text={r.criteria === "Anonymous" ? "Anonymous" : (r.reviewer || "Anonymous Student")} weight="font-bold" color="text-oasis-header" />
                                            <p className='text-[0.7rem] font-bold text-gray-400 uppercase'>{r.hte_name}</p>
                                        </div>
                                        <RatingLabel rating={String(r.rating)} />
                                    </div>
                                    <p className="text-sm text-gray-700 my-4 italic bg-gray-50 p-3 rounded-xl border border-gray-100">"{r.message}"</p>
                                    <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                                        <button onClick={() => approveReviewMutation.mutate(r.id)} className="px-6 py-2 bg-oasis-header text-white rounded-xl text-xs font-bold hover:bg-oasis-button-dark transition-all">Approve</button>
                                        <button onClick={() => rejectReviewMutation.mutate(r.id)} className="px-6 py-2 border border-oasis-red text-oasis-red rounded-xl text-xs font-bold hover:bg-red-50 transition-all">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 h-fit sticky top-5 shadow-sm">
                            <Subtitle text="Quick Filters" weight="font-bold" color="text-oasis-header" />
                            <div className="flex flex-col gap-6 mt-6">
                                <div>
                                    <Subtitle text="Workflow Status" size="text-xs" weight="font-bold" />
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {["PENDING", "APPROVED", "REJECTED"].map(s => (
                                            <Filter key={s} text={s.charAt(0) + s.slice(1).toLowerCase()} isActive={reviewStatus === s} onClick={() => setReviewStatus(s)} />
                                        ))}
                                    </div>
                                </div>
                                <Dropdown labelText="Rating Filter" categories={["All", "5", "4", "3", "2", "1"]} value={reviewRating === "" ? "All" : reviewRating} onChange={(val) => setReviewRating(val === "All" ? "" : val)} hasBorder />
                                <button onClick={() => refetchReviews()} className="w-full py-3 bg-oasis-header text-white rounded-xl font-bold hover:bg-oasis-button-dark transition-all shadow-lg shadow-oasis-header/10">Refresh Data</button>
                                <button onClick={() => { setReviewStatus("PENDING"); setReviewRating(""); setReviewHteName(""); }} className="w-full text-xs text-gray-400 underline cursor-pointer">Reset All Filters</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <HteDetailModal visible={!!selectedHte} hte={selectedHte} onClose={() => setSelectedHte(null)} />
            <ProgressModal visible={isProcessing} progress={progress} title={processingTitle} onCancel={() => abortController?.abort()} />
        </AdminScreen>
    );
}
