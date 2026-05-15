import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useRef } from 'react';
import Title from '../../../utilities/title.jsx';
import Subtitle from '../../../utilities/subtitle.jsx';
import OasisTable from '../../../components/oasisTable.jsx';
import { Filter } from '../../../components/adminComps.jsx';
import { AnnounceButton } from '../../../components/button.jsx';
import { FileUploadField, MultiField, SingleField } from '../../../components/fieldComp.jsx';
import { Text, HteLocation, ViewMoaButton } from '../../../utilities/tableUtil.jsx';
import { Check, Download, PlusCircle, Upload, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useHteOperations } from '../../../hooks/useHteOperations';

export default function HteManaging({ 
    search, 
    setPopup, 
    openPdf, 
    downloadMoa, 
    viewingId, 
    onRowClick,
    setIsProcessing,
    setProcessingTitle,
    setIsDownloading,
    setIsUploading
}) {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("status") || "";
    const [showAddHte, setShowAddHte] = useState(false);
    const uploadRef = useRef(null);

    // Using custom hook
    const { 
        htes, 
        htesLoading, 
        createHte, 
        exportHtes, 
        importHtes 
    } = useHteOperations(statusFilter);

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

    const resetForm = () => {
        setCompanyName(""); setCompanyAbout(""); setCompanyLoc(""); setStatusValue("ACTIVE");
        setIndustry(""); setWebsite(""); setContactPerson(""); setContactPosition("");
        setContactNumber(""); setContactEmail(""); setSignedAt(""); setValidity("");
        setEligibleCourses([]); setLogoFile(null); setThumbnailFile(null); setMoaFile(null);
    };

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

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

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

    const handleSaveHTE = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("company_name", companyName); formData.append("description", companyAbout); formData.append("address", companyLoc); formData.append("status", statusValue);
        formData.append("industry", industry); formData.append("website", website); formData.append("contact_person", contactPerson); formData.append("contact_position", contactPosition);
        formData.append("contact_number", contactNumber); formData.append("contact_email", contactEmail);
        if (signedAt) formData.append("signed_at", signedAt); if (validity) formData.append("validity", validity);
        formData.append("eligible_courses", JSON.stringify(eligibleCourses));
        if (logoFile) formData.append("logo", logoFile); if (thumbnailFile) formData.append("thumbnail", thumbnailFile); if (moaFile) formData.append("moa_file", moaFile);
        
        try {
            await createHte(formData);
            setPopup({ title: "Success", text: "HTE saved successfully", icon: <Check size={35}/>, type: "success" });
            resetForm();
            setShowAddHte(false);
        } catch (error) {
            setPopup({ title: "Error", text: "Failed to save HTE", icon: <X color="#800020" size={35}/>, type: "failed" });
        }
    };

    const handleDownloadHTEs = async () => {
        setIsProcessing(true); setIsDownloading(true); setProcessingTitle("Downloading HTEs...");
        try {
            await exportHtes(statusFilter);
        } catch { 
            setPopup({ title: "Error", text: "Download failed.", type: "failed" }); 
        } finally { 
            setIsProcessing(false); setIsDownloading(false); 
        }
    };

    const handleUploadFile = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setIsProcessing(true); setIsUploading(true); setProcessingTitle("Uploading HTEs...");
        try {
            const res = await importHtes(file);
            setPopup({ title: "Upload Completed", text: `Created: ${res.created_htes}`, type: "success" });
        } catch {
            setPopup({ title: "Upload Failed", type: "failed" });
        } finally {
            setIsProcessing(false); setIsUploading(false); e.target.value = "";
        }
    };

    return (
        <div className="w-full flex flex-col items-center animate__animated animate__fadeIn">
            <input ref={uploadRef} type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleUploadFile} />
            <div className='flex justify-between items-center w-[90%] mb-5 border-b border-gray-200 pb-3'>
                <Title text={"HTE Management & MOA Overview"} />
                <div className='flex gap-3'>
                    <AnnounceButton icon={<PlusCircle size={20}/>} btnText="Add HTE" onClick={() => setShowAddHte(!showAddHte)} />
                    <AnnounceButton icon={<Upload />} btnText="Import" onClick={() => uploadRef.current.click()} />
                    <AnnounceButton icon={<Download />} btnText="Export" onClick={handleDownloadHTEs} />
                </div>
            </div>

            {htesLoading ? <Subtitle text="Loading..." /> : (
                <OasisTable columns={hteColumns} data={filteredHtes} onRowClick={onRowClick}>
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
    );
}
