import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { Dropdown, Filter } from '../../components/adminComps.jsx';
import { Label, RatingLabel } from '../../utilities/label.jsx';
import { AnnounceButton, CoursesButton } from '../../components/button.jsx';
import Subtitle from '../../utilities/subtitle.jsx';
import { Text, HteLocation } from '../../utilities/tableUtil.jsx';
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AdminAPI } from "../../api/admin.api";
import { Check, Download, FileCheck, Save, Upload, X } from 'lucide-react';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';

export default function AdmOperations() {
    const [data, setData] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const categories = ["ACTIVE", "EXPIRED", "PENDING"];
    const hteDropdown = data.map(h => h.company_name);

    const status = searchParams.get("status");
    const uploadRef = useRef(null);

    const [activeFilter, setActiveFilter] = useState("");
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
    const [actionCompleted, setActionCompleted] = useState(false);

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
            alert("Failed to approve review");
        }
    };

    const handleRejectReview = async (id) => {
        try {
            await AdminAPI.rejectReview(id);
            fetchReviews();
        } catch (err) {
            console.error(err);
            alert("Failed to reject review");
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
        } catch (err) {
            console.error(err);
            alert("Approve all failed");
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
        } catch (err) {
            console.error(err);
            alert("Clear all failed");
        }
    };

    // =============================
    // FETCH HTEs
    // =============================
    useEffect(() => {
        AdminAPI.getHTEs(status)
            .then(res => setData(res.data))
            .catch(console.error);
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
            alert("Please fill required fields: Company Name, Industry, Location, Contact Person, Position, Contact Number, Email Address.");
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

            alert("HTE saved successfully");

            const res = await AdminAPI.getHTEs(status);
            setData(res.data);

            resetForm();
        } catch (err) {
            console.error(err);
            alert("Failed to save HTE");
        }
    };

    const handleDownload = async () => {
        try {
            const res = await AdminAPI.downloadHTEsExcel(status || "ALL");
            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `hte_overview_${status || "ALL"}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Download failed");
        }
    };

    const handleUploadPick = () => {
        uploadRef.current?.click();
    };

    const handleUploadFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await AdminAPI.uploadHTEsExcel(file);
            alert(
                `Upload done!\nCreated HTEs: ${res.data.created_htes}\nUpdated HTEs: ${res.data.updated_htes}\nFailed rows: ${res.data.failed_rows.length}`
            );

            const refreshed = await AdminAPI.getHTEs(status);
            setData(refreshed.data);
        } catch (err) {
            console.error(err);
            alert("Upload failed. Check console.");
        } finally {
            e.target.value = "";
        }
    };

    return (
        <AdminScreen>
            {confirmClear &&
                <ConfirmModal
                    confText='clear all?'
                    onCancel={() => setConfirmClear(false)}
                    onConfirm={() => {
                        setActionCompleted(true);
                        resetForm();
                    }}
                />
            }

            {actionCompleted &&
                <GeneralPopupModal
                    time={3000}
                    isNeutral={true}
                    icon={<FileCheck />}
                    title={"Action Completed."}
                    text={"HTE Information Cleared."}
                    onClose={() => setActionCompleted(false)}
                />
            }

            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b-2 py-5'>
                <Title text="Admin Operations" size='text-[2rem]'/>
                <Subtitle text={"Overview and Management of HTEs, upload or export HTE tables, and Moderate Student Reviews."}/>
            </div>

            <input
                ref={uploadRef}
                type="file"
                accept=".xlsx"
                style={{ display: "none" }}
                onChange={handleUploadFile}
            />

            <OasisTable columns={columns} data={data}>
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
                        />
                    </div>

                    <div className='w-full flex flex-row justify-end items-center gap-3'>
                        <AnnounceButton icon={<Upload />} btnText="Upload" onClick={handleUploadPick} />
                        <AnnounceButton icon={<Download />} btnText="Download" onClick={handleDownload} />
                    </div>
                </div>
            </OasisTable>

            <div className='flex justify-start items-start w-[80%]'>
                <Title text={"Add HTE"} />
            </div>

            <div className="w-[80%] p-5 rounded-3xl bg-admin-element flex flex-col gap-5 shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">
                <form className="w-full flex flex-col gap-5" onSubmit={handleSaveHTE}>
                    <div className="w-full grid grid-cols-2 p-2 text-oasis-button-dark">
                        <div className="w-full px-2 py-3 flex flex-col gap-5">
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
                                labelText="MOA"
                                fieldId="moaFile"
                                onChange={e => setMoaFile(e.target.files[0])}
                            />

                            <SingleField
                                labelText="Date Notarized (Signed Date)"
                                fieldHolder="YYYY-MM-DD"
                                fieldId="signedAt"
                                value={signedAt}
                                onChange={e => setSignedAt(e.target.value)}
                            />

                            <SingleField
                                labelText="Validity"
                                fieldHolder="Enter years or months"
                                fieldId="validity"
                                value={validity}
                                onChange={e => setValidity(e.target.value)}
                            />

                            <div className="w-full h-full flex justify-start items-end gap-5 px-5">
                                <AnnounceButton icon={<Save size={15} />} btnText="Save" type="submit" />
                                <AnnounceButton
                                    btnText="Clear all"
                                    type="button"
                                    onClick={() => setConfirmClear(true)}
                                />
                            </div>
                        </div>

                        <div className="w-full p-2 flex flex-col justify-start gap-5">
                            <div className="w-full p-2 flex flex-col gap-3">
                                <SingleField
                                    labelText="Company Name"
                                    fieldHolder="Enter company name"
                                    fieldId="companyName"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                />

                                <SingleField
                                    labelText="Nature of Business (Industry)"
                                    fieldHolder="Enter nature of business"
                                    fieldId="industry"
                                    value={industry}
                                    onChange={e => setIndustry(e.target.value)}
                                />

                                <MultiField
                                    labelText="About Company"
                                    fieldHolder="Enter company description"
                                    fieldId="companyAbout"
                                    value={companyAbout}
                                    onChange={e => setCompanyAbout(e.target.value)}
                                />

                                <SingleField
                                    labelText="Website"
                                    fieldHolder="https://example.com"
                                    fieldId="website"
                                    value={website}
                                    onChange={e => setWebsite(e.target.value)}
                                />

                                <SingleField
                                    labelText="Location"
                                    fieldHolder="Enter company address"
                                    fieldId="companyLoc"
                                    value={companyLoc}
                                    onChange={e => setCompanyLoc(e.target.value)}
                                />

                                <SingleField
                                    labelText="Contact Person"
                                    fieldHolder="Enter contact person"
                                    fieldId="contactPerson"
                                    value={contactPerson}
                                    onChange={e => setContactPerson(e.target.value)}
                                />

                                <SingleField
                                    labelText="Position"
                                    fieldHolder="Enter position"
                                    fieldId="contactPosition"
                                    value={contactPosition}
                                    onChange={e => setContactPosition(e.target.value)}
                                />

                                <SingleField
                                    labelText="Contact Number"
                                    fieldHolder="Enter contact number"
                                    fieldId="contactNumber"
                                    value={contactNumber}
                                    onChange={e => setContactNumber(e.target.value)}
                                />

                                <SingleField
                                    labelText="Email Address"
                                    fieldHolder="Enter email address"
                                    fieldId="contactEmail"
                                    value={contactEmail}
                                    onChange={e => setContactEmail(e.target.value)}
                                />

                                <Dropdown
                                    labelText="Status"
                                    categories={categories}
                                    value={statusValue}
                                    onChange={setStatusValue}
                                />

                                <Label labelText="Eligible Course" />
                                <section className="w-full flex flex-row flex-wrap gap-3">
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
                </form>
            </div>

            <div className='flex justify-start items-start w-[80%] mt-10'>
                <Title text={"Reviews Moderation"} />
            </div>

            <div className='w-[95%] max-w-[1800px] max-h-200 overflow-x-hidden p-5 rounded-3xl bg-admin-element flex flex-col items-center shadow-[0px_0px_10px_rgba(0,0,0,0.5)]'>
                <div className="w-full flex flex-col gap-2">
                    <Subtitle
                        text={"Approve or reject student reviews. Approved reviews will be visible on the public HTE profiles."}
                        size='text-[0.9rem]'
                    />
                    <Subtitle
                        text={reviewsLoading ? "Loading reviews..." : `Showing ${reviews.length} review(s)`}
                        size='text-[0.85rem]'
                        color="text-[#2D6259]"
                    />
                </div>

                <section className='w-full py-5 flex flex-row gap-6 justify-between items-start font-oasis-text'>
                    <div className="flex-1 h-full grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                        {reviews.length === 0 && !reviewsLoading && (
                            <div className="w-full p-5 bg-white rounded-3xl drop-shadow-[0px_2px_5px_rgba(0,0,0,0.2)]">
                                <Subtitle text="No reviews found for the selected filters." size="text-[0.95rem]" />
                            </div>
                        )}

                        {reviews.map((r) => (
                            <div
                                key={r.id}
                                className="relative w-full h-fit max-h-100 p-5 bg-white rounded-3xl drop-shadow-[0px_2px_5px_rgba(0,0,0,0.5)] transition duration-300 ease-in-out flex flex-col justify-evenly items-start"
                            >
                                <section className='w-full flex flex-row justify-between items-center gap-3'>
                                    <Subtitle
                                        text={r.reviewer || "Anonymous"}
                                        color={"text-[#2D6259]"}
                                        size='text-[1.2rem]'
                                        weight='font-bold'
                                    />
                                    <p className='font-oasis-text text-[0.75rem] italic text-right'>
                                        {r.hte_name} — {formatDateTime(r.created_at)}
                                    </p>
                                </section>

                                <section className='h-[50%] flex flex-col justify-start items-start gap-3 relative overflow-hidden mt-2'>
                                    <RatingLabel rating={String(r.rating)} />

                                    <div className="w-full flex flex-row justify-start items-center gap-2">
                                        <Subtitle text="Criteria:" size="text-[0.8rem]" weight="font-bold" />
                                        <p className="text-[0.8rem]">{r.criteria || "—"}</p>
                                    </div>

                                    <div className='overflow-x-hidden overflow-y-auto w-full max-h-35'>
                                        <p className='font-oasis-text text-[0.8rem] text-justify w-full'>
                                            {r.message}
                                        </p>
                                    </div>
                                </section>

                                <section className='w-full h-full flex justify-center items-center gap-5 px-5 mt-3'>
                                    <AnnounceButton
                                        icon={<Check size={25} />}
                                        type="button"
                                        btnText=''
                                        onClick={() => handleApproveReview(r.id)}
                                    />
                                    <AnnounceButton
                                        btnText=""
                                        type="button"
                                        isRed={true}
                                        icon={<X size={25} />}
                                        onClick={() => handleRejectReview(r.id)}
                                    />
                                </section>
                            </div>
                        ))}
                    </div>

                    <div className='w-[40%] p-3 flex flex-col justify-start items-start sticky top-0 transiiton-all duration-100 ease-in-out'>
                        <Subtitle text={"Status"} size={'text-[1rem]'} weight='font-bold' />
                        <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                            <div onClick={() => setReviewStatus("PENDING")} className="cursor-pointer">
                                <Filter text={'Pending'} isActive={reviewStatus === "PENDING"} />
                            </div>
                            <div onClick={() => setReviewStatus("APPROVED")} className="cursor-pointer">
                                <Filter text={'Approved'} isActive={reviewStatus === "APPROVED"} />
                            </div>
                            <div onClick={() => setReviewStatus("REJECTED")} className="cursor-pointer">
                                <Filter text={'Rejected'} isActive={reviewStatus === "REJECTED"} />
                            </div>
                        </div>

                        <Subtitle text={"Review Criteria"} size={'text-[1rem]'} weight='font-bold' />
                        <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                            <div onClick={() => setReviewCriteria("")} className="cursor-pointer">
                                <Filter text={'All'} isActive={reviewCriteria === ""} />
                            </div>
                            {REVIEW_CRITERIA.map(c => (
                                <div key={c} onClick={() => setReviewCriteria(c)} className="cursor-pointer">
                                    <Filter text={c} isActive={reviewCriteria === c} />
                                </div>
                            ))}
                        </div>

                        <Subtitle text={"Date Posted"} size={'text-[1rem]'} weight='font-bold' />
                        <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                            <div onClick={() => setReviewSort("newest")} className="cursor-pointer">
                                <Filter text={'Newest'} isActive={reviewSort === "newest"} />
                            </div>
                            <div onClick={() => setReviewSort("oldest")} className="cursor-pointer">
                                <Filter text={'Oldest'} isActive={reviewSort === "oldest"} />
                            </div>
                        </div>

                        <Subtitle text={"Ratings"} size={'text-[1rem]'} weight='font-bold' />
                        <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                            <div onClick={() => setReviewRating("")} className="cursor-pointer">
                                <Filter text={'All'} isActive={reviewRating === ""} />
                            </div>
                            {["5", "4", "3", "2", "1"].map(stars => (
                                <div key={stars} onClick={() => setReviewRating(stars)} className="cursor-pointer">
                                    <Filter text={`${stars} stars`} isActive={reviewRating === stars} />
                                </div>
                            ))}
                        </div>

                        <Subtitle text={"HTE"} size={'text-[1rem]'} weight='font-bold' />
                        <div className='mt-3 w-full flex flex-wrap justify-start items-start gap-1'>
                            <Dropdown
                                labelText=""
                                fieldId="reviewHTE"
                                categories={hteDropdown}
                                value={reviewHteName}
                                onChange={setReviewHteName}
                            />
                        </div>

                        <div className='mt-3 p-5 w-full flex justify-between items-center gap-2'>
                            <AnnounceButton btnText='Approve All' onClick={handleApproveAll} />
                            <AnnounceButton btnText='Clear All' onClick={handleClearAll} />
                        </div>

                        <div className='mt-1 px-5 w-full flex justify-between items-center gap-2'>
                            <AnnounceButton btnText='Refresh' onClick={fetchReviews} />
                            <AnnounceButton
                                btnText='Reset Filters'
                                onClick={() => {
                                    setReviewStatus("PENDING");
                                    setReviewCriteria("");
                                    setReviewSort("newest");
                                    setReviewRating("");
                                    setReviewHteName("");
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </AdminScreen>
    );
}