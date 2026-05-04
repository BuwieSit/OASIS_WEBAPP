import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { Dropdown, Filter } from '../../components/adminComps.jsx';
import { Label, RatingLabel } from '../../utilities/label.jsx';
import { AnnounceButton, CoursesButton } from '../../components/button.jsx';
import Subtitle from '../../utilities/subtitle.jsx';
import { Text, HteLocation } from '../../utilities/tableUtil.jsx';
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AdminAPI } from "../../api/admin.api";
import { Check, Download, FileCheck, Save, Upload, X, PlusCircle } from 'lucide-react';
import { ConfirmModal, GeneralPopupModal, ProgressModal } from '../../components/popupModal.jsx';
import HteDetailModal from '../../components/HteDetailModal.jsx';
import SearchBar from '../../components/searchBar.jsx';

export default function AdmOperations() {
    const [data, setData] = useState([]);
    const [htesLoading, setHtesLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const categories = ["ACTIVE", "EXPIRED", "PENDING"];
    const hteDropdown = data.map(h => h.company_name);

    const status = searchParams.get("status");
    const uploadRef = useRef(null);
    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        if (!search) return data;
        const s = search.toLowerCase();
        return data.filter(h => 
            h.company_name?.toLowerCase().includes(s) ||
            h.industry?.toLowerCase().includes(s) ||
            h.address?.toLowerCase().includes(s) ||
            h.contact_person?.toLowerCase().includes(s)
        );
    }, [data, search]);
    
    const [activeFilter, setActiveFilter] = useState("");
    const [selectedHte, setSelectedHte] = useState(null);
    // =============================
    // ADD HTE FORM STATE
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
    const [validity, setValidity] = useState(""); // months

    const [eligibleCourses, setEligibleCourses] = useState([]);

    const [logoFile, setLogoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [moaFile, setMoaFile] = useState(null);

    const [confirmClear, setConfirmClear] = useState(false);
    const [popup, setPopup] = useState(null);

    // Progress and Processing State
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingTitle, setProcessingTitle] = useState("");
    const [abortController, setAbortController] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // =============================
    // REVIEWS MODERATION STATE
    // =============================
    const REVIEW_CRITERIA = [
        "Learning Experience",
        "Skill Acquisition",
        "Adequate Supervisor Support",
        "Course related",
        "Others",
    ];

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const [reviewStatus, setReviewStatus] = useState("PENDING");
    const [reviewCriteria, setReviewCriteria] = useState("");
    const [reviewSort, setReviewSort] = useState("newest");
    const [reviewRating, setReviewRating] = useState("");
    const [reviewHteName, setReviewHteName] = useState("");

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const params = {
                status: reviewStatus,
                sort: reviewSort,
            };
            if (reviewCriteria) params.criteria = reviewCriteria;
            if (reviewRating) params.rating = reviewRating;
            if (reviewHteName) params.hte_name = reviewHteName;

            const res = await AdminAPI.getReviews(params);
            setReviews(res.data || []);
        } catch (err) {
            console.error(err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [reviewStatus, reviewCriteria, reviewSort, reviewRating, reviewHteName]);

    const formatDateTime = (iso) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleString();
        } catch {
            return "—";
        }
    };

    const handleApproveReview = async (id) => {
        try {
            await AdminAPI.approveReview(id);
            fetchReviews();
        } catch (err) {
            console.error(err);
            setPopup({
                title: "Error",
                text: "Failed to approve review.",
                icon: <X color="#800020" size={35}/>,
                type: "failed"
            });
        }
    };

    const handleRejectReview = async (id) => {
        try {
            await AdminAPI.rejectReview(id);
            fetchReviews();
        } catch (err) {
            console.error(err);
            setPopup({
                title: "Error",
                text: "Failed to reject review.",
                icon: <X color="#800020" size={35}/>,
                type: "failed"
            });
        }
    };

    const handleApproveAll = async () => {
        try {
            const params = {
                status: reviewStatus,
                sort: reviewSort,
            };
            if (reviewCriteria) params.criteria = reviewCriteria;
            if (reviewRating) params.rating = reviewRating;
            if (reviewHteName) params.hte_name = reviewHteName;

            await AdminAPI.approveAllReviews(params);
            fetchReviews();
            setPopup({
                title: "Success",
                text: "All reviews approved.",
                icon: <Check size={35}/>,
                type: "success"
            });
        } catch (err) {
            console.error(err);
            setPopup({
                title: "Error",
                text: "Approve all failed.",
                icon: <X color="#800020" size={35}/>,
                type: "failed"
            });
        }
    };

    const handleClearAll = async () => {
        try {
            const params = {
                status: reviewStatus,
                sort: reviewSort,
            };
            if (reviewCriteria) params.criteria = reviewCriteria;
            if (reviewRating) params.rating = reviewRating;
            if (reviewHteName) params.hte_name = reviewHteName;

            await AdminAPI.clearAllPendingReviews(params);
            fetchReviews();
            setPopup({
                title: "Success",
                text: "All pending reviews cleared.",
                icon: <Check size={35}/>,
                type: "success"
            });
        } catch (err) {
            console.error(err);
            setPopup({
                title: "Error",
                text: "Clear all failed.",
                icon: <X color="#800020" size={35}/>,
                type: "failed"
            });
        }
    };

    // =============================
    // FETCH HTEs
    // =============================
    useEffect(() => {
        setHtesLoading(true);
        AdminAPI.getHTEs(status)
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setHtesLoading(false));
    }, [status]);

    // =============================
    // HELPERS
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

    const calcValidity = (row) => {
        const rawValidity =
            row?.moa?.validity_years ??
            row?.moa_validity_years ??
            row?.moa_validity ??
            null;

        if (rawValidity !== null && rawValidity !== undefined && rawValidity !== "") {
            const num = Number(rawValidity);
            if (!Number.isNaN(num)) {
                return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)} year${num !== 1 ? "s" : ""}`;
            }
        }

        const signed = row?.moa?.signed_at || row?.moa_signed_at;
        const expiry = row?.moa?.expires_at || row?.moa_expiry_date;

        if (!signed || !expiry) return "—";

        const start = new Date(signed);
        const end = new Date(expiry);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";

        const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        if (months <= 0) return "—";

        const years = months / 12;
        return `${years % 1 === 0 ? years.toFixed(0) : years.toFixed(2)} year${years !== 1 ? "s" : ""}`;
    };

    const toggleCourse = (course) => {
        setEligibleCourses(prev =>
            prev.includes(course)
                ? prev.filter(c => c !== course)
                : [...prev, course]
        );
    };

    const resetForm = () => {
        setCompanyName("");
        setCompanyAbout("");
        setCompanyLoc("");
        setStatusValue("ACTIVE");

        setIndustry("");
        setWebsite("");
        setContactPerson("");
        setContactPosition("");
        setContactNumber("");
        setContactEmail("");
        setSignedAt("");
        setValidity("");

        setEligibleCourses([]);
        setLogoFile(null);
        setThumbnailFile(null);
        setMoaFile(null);

        setConfirmClear(false);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

    // =============================
    // TABLE COLUMNS
    // =============================
    const columns = [
        { header: "HTE Name", render: r => <Text text={r.company_name} /> },
        { header: "Industry", render: r => <Text text={r.industry} /> },
        { header: "Location", render: r => <HteLocation address={r.address} /> },
        { header: "Status", render: r => <Text text={getDisplayStatus(r)} /> },
        { header: "MOA Validity", render: r => <Text text={calcValidity(r)} /> },
        { header: "Signed Date", render: r => <Text text={formatDate(r.moa?.signed_at || r.moa_signed_at)} /> },
        { header: "Expiry Date", render: r => <Text text={formatDate(r.moa?.expires_at || r.moa_expiry_date)} /> },
    ];

    const handleSaveHTE = async (e) => {
        e.preventDefault();

        if (!companyName || !industry || !companyLoc || !contactPerson || !contactPosition || !contactNumber || !contactEmail) {
            setPopup({
                title: "Validation Error",
                text: "Please fill required fields: Company Name, Industry, Location, Contact Person, Position, Contact Number, Email Address.",
                icon: <X color="#800020" size={35}/>,
                type: "failed"
            });
            return;
        }

        const formData = new FormData();
        formData.append("company_name", companyName);
        formData.append("description", companyAbout);
        formData.append("address", companyLoc);
        formData.append("status", statusValue);

        formData.append("industry", industry);
        formData.append("website", website);

        formData.append("contact_person", contactPerson);
        formData.append("contact_position", contactPosition);
        formData.append("contact_number", contactNumber);
        formData.append("contact_email", contactEmail);

        if (signedAt) formData.append("signed_at", signedAt);
        if (validity) formData.append("validity", validity);

        formData.append("eligible_courses", JSON.stringify(eligibleCourses));

        if (logoFile) formData.append("logo", logoFile);
        if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
        if (moaFile) formData.append("moa_file", moaFile);

        try {
            await AdminAPI.createHTE(formData);

            setPopup({
                title: "Success",
                text: "HTE saved successfully",
                icon: <Check size={35}/>,
                type: "success"
            });

            const res = await AdminAPI.getHTEs(status);
            setData(res.data);

            resetForm();
        } catch (err) {
            console.error(err);
            setPopup({
                title: "Error",
                text: "Failed to save HTE",
                icon: <X color="#800020" size={35}/>,
                type: "failed"
            });
        }
    };

    const handleDownload = async () => {
        const controller = new AbortController();
        setAbortController(controller);
        setIsProcessing(true);
        setIsDownloading(true);
        setProcessingTitle("Downloading HTEs...");
        setProgress(0);

        try {
            const res = await AdminAPI.downloadHTEsExcel(status || "ALL", {
                signal: controller.signal,
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    } else {
                        setProgress(prev => Math.min(prev + 5, 95));
                    }
                }
            });

            setProgress(100);
            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            await new Promise(r => setTimeout(r, 600));

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `hte_overview_${status || "ALL"}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            setIsProcessing(false);
            setPopup({
                title: "Download Successful",
                text: "The HTE list has been downloaded successfully.",
                icon: <Check size={35} color="#22C55E"/>,
                type: "success"
            });
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                console.log('Download canceled');
            } else {
                console.error(err);
                setPopup({
                    title: "Error",
                    text: "Download failed. Please try again later.",
                    icon: <X color="#800020" size={35}/>,
                    type: "failed"
                });
            }
            setIsProcessing(false);
        } finally {
            setIsDownloading(false);
            setAbortController(null);
            setProgress(0);
        }
    };

    const handleUploadPick = () => {
        if (isProcessing) return;
        uploadRef.current?.click();
    };

    const handleUploadFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const controller = new AbortController();
        setAbortController(controller);
        setIsProcessing(true);
        setIsUploading(true);
        setProcessingTitle("Uploading HTEs...");
        setProgress(0);

        try {
            const res = await AdminAPI.uploadHTEsExcel(file, {
                signal: controller.signal,
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                }
            });

            setProgress(100);
            await new Promise(r => setTimeout(r, 600));

            setIsProcessing(false);
            setPopup({
                title: "Upload Completed",
                text: `Created: ${res.data.created_htes} | Updated: ${res.data.updated_htes} | Failed: ${res.data.failed_rows.length}`,
                icon: <FileCheck size={35}/>,
                type: "success",
                time: 5000
            });

            const refreshed = await AdminAPI.getHTEs(status);
            setData(refreshed.data);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                console.log('Upload canceled');
            } else {
                console.error(err);
                setPopup({
                    title: "Upload Failed",
                    text: "The file upload failed. Please check the format and try again.",
                    icon: <X color="#800020" size={35}/>,
                    type: "failed"
                });
            }
            setIsProcessing(false);
        } finally {
            setIsUploading(false);
            setAbortController(null);
            setProgress(0);
            e.target.value = "";
        }
    };

    const [showAddHte, setShowAddHte] = useState(false);
    const [viewTab, setViewTab] = useState("hte");

    return (
        <AdminScreen>
            {confirmClear &&
                <ConfirmModal
                    confText='clear all?'
                    onCancel={() => setConfirmClear(false)}
                    onConfirm={() => {
                        setPopup({
                            title: "Action Completed.",
                            text: "HTE Information Cleared.",
                            icon: <FileCheck />,
                            type: "neutral",
                            time: 3000
                        });
                        resetForm();
                    }}
                />
            }

            {popup && (
                <GeneralPopupModal
                    icon={popup.icon}
                    time={popup.time || 3000}
                    title={popup.title}
                    text={popup.text}
                    onClose={() => setPopup(null)}
                    isSuccess={popup.type === "success"}
                    isFailed={popup.type === "failed"}
                    isNeutral={popup.type === "neutral"}
                />
            )}

            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="Operations" size='text-[2rem]'/>
                <Subtitle text={"Overview and Management of HTEs, upload or export HTE tables, and Moderate Student Reviews."}/>
            </div>

            <div className='flex flex-row justify-between items-center gap-3 w-[90%] mt-5'>
                <div className='flex gap-3'>
                    <Subtitle
                        text="HTE Management"
                        onClick={() => setViewTab("hte")}
                        isActive={viewTab === "hte"}
                        isLink
                        weight={"font-bold"}
                        size="text-[1rem]"
                        className={"rounded-2xl"}
                    />
                    <Subtitle text="|" size="text-[1rem]" />
                    <Subtitle
                        text="Reviews Moderation"
                        onClick={() => setViewTab("reviews")}
                        isActive={viewTab === "reviews"}
                        isLink
                        weight={"font-bold"}
                        size="text-[1rem]"
                        className={"rounded-2xl"}
                    />
                </div>
                
            </div>

            <input
                ref={uploadRef}
                type="file"
                accept=".xlsx"
                style={{ display: "none" }}
                onChange={handleUploadFile}
            />

            {viewTab === "hte" && (
                <div className="w-full flex flex-col items-center animate__animated animate__fadeIn">
                    <div className='flex justify-between items-center w-[90%] mb-5 border-b border-gray-200 pb-3'>
                        <Title text={"HTE Management"} />
                        <div className='flex flex-row justify-end items-center z-70'>
                            <SearchBar
                                value={search}
                                onChange={setSearch}
                            />
                        </div>
                    </div>
                    {htesLoading ? (
                        
                        <div className="w-[80%] flex justify-start items-center h-40">
                            <Subtitle text="Loading HTEs..." />
                        </div>
                    ) : (
                        <OasisTable 
                            columns={columns} 
                            data={filteredData}
                            onRowClick={(row) => setSelectedHte(row)}
                        >
                            <div className="w-full flex flex-row justify-between items-center gap-4 mt-4">
                                <div className='flex flex-row gap-3 items-center justify-start'>
                                    <Subtitle
                                        text="All"
                                        isLink
                                        isActive={activeFilter === "All"}
                                        onClick={() => {
                                            navigate("/admOperations")
                                            setActiveFilter("All")
                                        }}
                                        size="text-[1rem]"
                                        className={"rounded-2xl"}
                                        weight={"font-bold"}
                                    />
                                    <Subtitle text={"|"} size='text-[1rem]' />
                                    <Subtitle
                                        text="ACTIVE"
                                        isLink
                                        isActive={activeFilter === "Active"}
                                        onClick={() => {
                                            navigate("/admOperations?status=ACTIVE")
                                            setActiveFilter("Active")
                                        }}
                                        size="text-[1rem]"
                                        className={"rounded-2xl"}
                                        weight={"font-bold"}
                                    />
                                    <Subtitle text={"|"} size='text-[1rem]' />
                                    <Subtitle
                                        text="EXPIRED"
                                        isActive={activeFilter === "Expired"}
                                        isLink
                                        onClick={() => {
                                            navigate("/admOperations?status=EXPIRED")
                                            setActiveFilter("Expired")
                                        }}
                                        size="text-[1rem]"
                                        className={"rounded-2xl"}
                                        weight={"font-bold"}
                                    />
                                </div>

                                <div className='w-full flex flex-row justify-end items-center gap-3'>
                                    <AnnounceButton 
                                        icon={<Upload />} 
                                        btnText={isUploading ? "Uploading..." : "Upload"} 
                                        onClick={handleUploadPick} 
                                        disabled={isProcessing}
                                    />
                                    <AnnounceButton 
                                        icon={<Download />} 
                                        btnText={isDownloading ? "Downloading..." : "Download"} 
                                        onClick={handleDownload} 
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>
                        </OasisTable>
                    )}

                    <ProgressModal
                        visible={isProcessing}
                        progress={progress}
                        title={processingTitle}
                        onCancel={() => {
                            if (abortController) {
                                abortController.abort();
                                setIsProcessing(false);
                                setAbortController(null);
                                setProgress(0);
                            }
                        }}
                    />

                    <HteDetailModal 
                        visible={!!selectedHte} 
                        hte={selectedHte} 
                        onClose={() => setSelectedHte(null)} 
                    />

                    {/* TOGGLE ADD HTE BUTTON */}
                    <div className="w-[90%] flex justify-end mt-5">
                        <AnnounceButton 
                            icon={showAddHte ? <X size={20} /> : <PlusCircle size={20} />} 
                            btnText={showAddHte ? "Close Add Form" : "Add Individual HTE"} 
                            onClick={() => setShowAddHte(!showAddHte)}
                        />
                    </div>

                    {/* HTE ADD SECTION */}
                    {showAddHte && (
                        <div className="w-[90%] flex flex-col items-center animate__animated animate__fadeIn mt-5">
                            <div className='flex justify-start items-start w-full mb-3'>
                                <Title text={"Add HTE"} />
                            </div>

                            <div className="w-full p-8 rounded-3xl bg-admin-element flex flex-col gap-5 shadow-[0px_4px_20px_rgba(0,0,0,0.1)] border border-gray-200">
                                <form className="w-full flex flex-col gap-5" onSubmit={handleSaveHTE}>
                                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 text-oasis-button-dark">
                                        <div className="w-full flex flex-col gap-6">
                                            <div className="p-5 bg-white/50 rounded-2xl border border-gray-200 space-y-5">
                                                <FileUploadField
                                                    labelText="Upload Logo"
                                                    fieldId="logoFile"
                                                    onChange={e => setLogoFile(e.target.files[0])}
                                                />
                                                <FileUploadField
                                                    labelText="Upload HTE Thumbnail"
                                                    fieldId="thumbnailFile"
                                                    onChange={e => setThumbnailFile(e.target.files[0])}
                                                />
                                                <FileUploadField
                                                    labelText="MOA File"
                                                    fieldId="moaFile"
                                                    onChange={e => setMoaFile(e.target.files[0])}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <SingleField
                                                    labelText="Date Notarized"
                                                    fieldHolder="YYYY-MM-DD"
                                                    fieldId="signedAt"
                                                    value={signedAt}
                                                    onChange={e => setSignedAt(e.target.value)}
                                                />

                                                <SingleField
                                                    labelText="Validity (Months/Years)"
                                                    fieldHolder="e.g., 36 months"
                                                    fieldId="validity"
                                                    value={validity}
                                                    onChange={e => setValidity(e.target.value)}
                                                />
                                            </div>

                                            <div className="w-full mt-auto flex justify-start items-center gap-5 pt-5 border-t border-gray-300">
                                                <AnnounceButton icon={<Save size={20} />} btnText="Save HTE" type="submit" />
                                                <AnnounceButton
                                                    btnText="Clear Fields"
                                                    type="button"
                                                    onClick={() => setConfirmClear(true)}
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full flex flex-col gap-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SingleField
                                                    labelText="Company Name *"
                                                    fieldHolder="Enter company name"
                                                    fieldId="companyName"
                                                    value={companyName}
                                                    onChange={e => setCompanyName(e.target.value)}
                                                />

                                                <SingleField
                                                    labelText="Industry *"
                                                    fieldHolder="Enter nature of business"
                                                    fieldId="industry"
                                                    value={industry}
                                                    onChange={e => setIndustry(e.target.value)}
                                                />
                                            </div>

                                            <MultiField
                                                labelText="About Company"
                                                fieldHolder="Enter company description"
                                                fieldId="companyAbout"
                                                value={companyAbout}
                                                onChange={e => setCompanyAbout(e.target.value)}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SingleField
                                                    labelText="Website"
                                                    fieldHolder="https://example.com"
                                                    fieldId="website"
                                                    value={website}
                                                    onChange={e => setWebsite(e.target.value)}
                                                />

                                                <SingleField
                                                    labelText="Location *"
                                                    fieldHolder="Enter company address"
                                                    fieldId="companyLoc"
                                                    value={companyLoc}
                                                    onChange={e => setCompanyLoc(e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SingleField
                                                    labelText="Contact Person *"
                                                    fieldHolder="Enter contact person"
                                                    fieldId="contactPerson"
                                                    value={contactPerson}
                                                    onChange={e => setContactPerson(e.target.value)}
                                                />

                                                <SingleField
                                                    labelText="Position *"
                                                    fieldHolder="Enter position"
                                                    fieldId="contactPosition"
                                                    value={contactPosition}
                                                    onChange={e => setContactPosition(e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SingleField
                                                    labelText="Contact Number *"
                                                    fieldHolder="Enter contact number"
                                                    fieldId="contactNumber"
                                                    value={contactNumber}
                                                    onChange={e => setContactNumber(e.target.value)}
                                                />

                                                <SingleField
                                                    labelText="Email Address *"
                                                    fieldHolder="Enter email address"
                                                    fieldId="contactEmail"
                                                    value={contactEmail}
                                                    onChange={e => setContactEmail(e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                                <Dropdown
                                                    labelText="Operational Status"
                                                    categories={categories}
                                                    value={statusValue}
                                                    onChange={setStatusValue}
                                                />
                                                
                                                <div className="flex flex-col gap-2">
                                                    <Label labelText="Eligible Courses" />
                                                    <section className="w-full flex flex-row flex-wrap gap-2">
                                                        {["DIT", "DLMOT", "DEET", "DMET", "DCvET", "DCpET", "DRET", "DECET"].map(c =>
                                                            <CoursesButton
                                                                key={c}
                                                                text={c}
                                                                isActive={eligibleCourses.includes(c)}
                                                                onClick={() => toggleCourse(c)}
                                                            />
                                                        )}
                                                    </section>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* REVIEWS SECTION */}
            {viewTab === "reviews" && (
                <div className='w-[90%] flex flex-col items-center mb-20 animate__animated animate__fadeIn'>
                    <div className='flex justify-start items-start w-full mb-5 border-b border-gray-200 pb-3'>
                        <Title text={"Reviews Moderation"} />
                    </div>

                    <div className='w-full p-8 rounded-[2.5rem] bg-admin-element flex flex-col gap-6 shadow-[0px_4px_30px_rgba(0,0,0,0.05)] border border-gray-200'>
                        <div className="w-full flex flex-col gap-1 border-l-4 border-oasis-header pl-4">
                            <Subtitle
                                text={"Audit student-submitted HTE reviews. Approved items will be displayed on public establishment profiles."}
                                size='text-[1rem]'
                                weight='font-medium'
                            />
                            <p className="text-xs font-bold uppercase tracking-widest text-oasis-icons">
                                {reviewsLoading ? "Fetching Database..." : `${reviews.length}  items found`}
                            </p>
                        </div>

                        <section className='w-full flex flex-col lg:flex-row gap-8 items-start'>
                            {/* LEFT: REVIEWS GRID */}
                            <div className="flex-1 grid gap-6 grid-cols-1 xl:grid-cols-2 w-full">
                                {reviews.length === 0 && !reviewsLoading && (
                                    <div className="col-span-full p-10 bg-white/50 rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                        <FileCheck size={48} className="mb-2 opacity-20" />
                                        <p className="font-bold">No reviews match your current filter.</p>
                                    </div>
                                )}

                                {reviews.map((r) => (
                                    <div
                                        key={r.id}
                                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col gap-4 animate__animated animate__fadeIn"
                                    >
                                        <section className='w-full flex flex-row justify-between items-start'>
                                            <div>
                                                <Subtitle
                                                    text={r.criteria === "Anonymous" ? "Anonymous" : (r.reviewer || "Anonymous Student")}
                                                    color={"text-oasis-header"}
                                                    size='text-[1.1rem]'
                                                    weight='font-bold'
                                                />
                                                <p className='text-[0.7rem] font-bold text-gray-400 uppercase tracking-tighter'>
                                                    {r.hte_name}
                                                </p>
                                            </div>
                                            <p className='text-[0.65rem] text-gray-400 italic bg-gray-50 px-2 py-1 rounded-lg'>
                                                {formatDateTime(r.created_at)}
                                            </p>
                                        </section>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <RatingLabel rating={String(r.rating)} />
                                                <span className="text-[0.7rem] bg-oasis-blue/30 px-2 py-0.5 rounded-full font-bold text-oasis-icons">
                                                    {r.criteria || "General"}
                                                </span>
                                            </div>

                                            <div className='bg-gray-50/50 p-4 rounded-2xl min-h-24 max-h-40 overflow-y-auto custom-scrollbar border border-gray-100'>
                                                <p className='text-table-text-size text-gray-700 leading-relaxed italic'>
                                                    "{r.message}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className='flex justify-end items-center gap-3 mt-2 pt-4 border-t border-gray-50'>
                                            <button 
                                                onClick={() => handleRejectReview(r.id)}
                                                className="p-3 text-oasis-red hover:bg-red-50 rounded-xl transition-all"
                                                title="Reject Review"
                                            >
                                                <X size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleApproveReview(r.id)}
                                                className="px-6 py-2 bg-oasis-header text-white rounded-xl font-bold text-sm shadow-lg shadow-oasis-header/10 hover:bg-oasis-button-dark transition-all flex items-center gap-2"
                                            >
                                                <Check size={18} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT: FILTERS PANEL (STICKY) */}
                            <div className='w-full lg:w-[350px] flex flex-col gap-6 sticky top-5'>
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-oasis-header mb-1">
                                            <Save size={18} />
                                            <span className="font-bold text-sm uppercase tracking-wider">Quick Filters</span>
                                        </div>

                                        <div>
                                            <Subtitle text={"Workflow Status"} size={'text-[0.8rem]'} weight='font-bold' />
                                            <div className='flex flex-wrap gap-1 mt-2'>
                                                {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                                                    <div key={s} onClick={() => setReviewStatus(s)} className="cursor-pointer">
                                                        <Filter text={s.charAt(0) + s.slice(1).toLowerCase()} isActive={reviewStatus === s} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Subtitle text={"Star Ratings"} size={'text-[0.8rem]'} weight='font-bold' />
                                            <div className='flex flex-wrap gap-1 mt-2'>
                                                <div onClick={() => setReviewRating("")} className="cursor-pointer">
                                                    <Filter text={'All'} isActive={reviewRating === ""} />
                                                </div>
                                                {["5", "4", "3", "2", "1"].map(stars => (
                                                    <div key={stars} onClick={() => setReviewRating(stars)} className="cursor-pointer">
                                                        <Filter text={`${stars} stars`} isActive={reviewRating === stars} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Subtitle text={"Search by HTE"} size={'text-[0.8rem]'} weight='font-bold' />
                                            <div className="mt-2">
                                                <Dropdown
                                                    labelText=""
                                                    fieldId="reviewHTE"
                                                    categories={hteDropdown}
                                                    value={reviewHteName}
                                                    onChange={setReviewHteName}
                                                    hasBorder
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleApproveAll}
                                                className="flex-1 py-2 border border-oasis-header text-oasis-header rounded-xl font-bold text-xs hover:bg-oasis-header hover:text-white transition-all cursor-pointer"
                                            >
                                                Approve All
                                            </button>
                                            <button 
                                                onClick={handleClearAll}
                                                className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-300 transition-all cursor-pointer"
                                            >
                                                Clear Pending
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={fetchReviews}
                                                className="flex-1 py-2 border border-oasis-header text-oasis-header rounded-xl font-bold text-xs hover:bg-oasis-header hover:text-white transition-all cursor-pointer"
                                            >
                                                Refresh Data
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setReviewStatus("PENDING"); setReviewCriteria(""); setReviewSort("newest");
                                                    setReviewRating(""); setReviewHteName("");
                                                }}
                                                className="flex-1 py-2 text-gray-400 hover:text-gray-600 font-bold text-xs transition-all underline underline-offset-4 cursor-pointer"
                                            >
                                                Reset All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </AdminScreen>
    );
}
