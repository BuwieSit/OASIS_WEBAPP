import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    ViewMoaButton
} from "../../utilities/tableUtil.jsx";
import { GeneralPopupModal, ViewModal } from '../../components/popupModal';
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { useEffect, useState } from 'react';
import Subtitle from '../../utilities/subtitle.jsx';
import { AdminAPI } from "../../api/admin.api";
import { Dropdown } from '../../components/adminComps.jsx';

export default function MoaOverview() {
    const [activeFilter, setFilter] = useQueryParam("tab", "overview");

    const [currentMoas, setCurrentMoas] = useState([]);
    const [prospectMoas, setProspectMoas] = useState([]);

    const [openView, setOpenView] = useState(false);
    const [filePdf, setFilePdf] = useState(null);
    const [loadingProspects, setLoadingProspects] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const [successModal, setSuccessModal] = useState(false);
    const [action, setAction] = useState("");
    const [lastStatus, setLastStatus] = useState("");

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const prospectStatusOptions = [
        "EMAILED_TO_HTE",
        "FOR_SIGNATURE",
        "ULCO",
        "RETRIEVED_FROM_ULCO",
        "APPROVED",
        "CANCELLED",
    ];
    const prospectStatusColors = {
        EMAILED_TO_HTE: "text-oasis-aqua",
        FOR_SIGNATURE: "text-oasis-blue",
        ULCO: "text-oasis-header",
        RETRIEVED_FROM_ULCO: "text-oasis-button-light",
        APPROVED: "text-green-500",
        CANCELLED: "text-red-500"
    };

    useEffect(() => {
        if (activeFilter === "overview") {
            loadCurrentMoas();
        }

        if (activeFilter === "submissions") {
            loadProspects();
        }
    }, [activeFilter]);

    const loadCurrentMoas = async () => {
        try {
            const res = await AdminAPI.getMoas();
            setCurrentMoas(res.data || []);
        } catch (err) {
            console.error("MOA overview fetch error:", err);
            setCurrentMoas([]);
        }
    };

    const loadProspects = async () => {
        try {
            setLoadingProspects(true);
            const res = await AdminAPI.getMoaProspects();
            setProspectMoas(res.data || []);
        } catch (err) {
            console.error("MOA prospects fetch error:", err);
            setProspectMoas([]);
        } finally {
            setLoadingProspects(false);
        }
    };

    const buildFileUrl = (filePath) => {
        if (!filePath) return null;

        let path = String(filePath).trim();

        if (path.startsWith("/")) {
            path = path.slice(1);
        }

        if (path.startsWith("uploads/")) {
            path = path.replace("uploads/", "");
        }
        console.log(`Filepath: ${API_BASE}/uploads/${path}`);

        return `${API_BASE}/uploads/${path}`;
        
    };

    const openPdf = (filePath) => {
        const url = buildFileUrl(filePath);
        if (!url) return;

        setFilePdf(url);
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

    const handleStatusChange = async (id, status) => {
        try {
            setProcessingId(id);
            await AdminAPI.updateMoaProspectStatus(id, status);
            await Promise.all([loadProspects(), loadCurrentMoas()]);
        } catch (err) {
            console.error("Update MOA prospect status failed:", err);
            alert(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to update MOA prospect status."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const formatProspectStatus = (status) => {
        if (!status) return "PENDING";
        if (status === "CANCELLED") return "REJECTED";
        return status;
    };

    const currentMoaColumns = [
        {
            header: "HTE Name",
            render: r => <Text text={r.hte?.company_name || "—"} />
        },
        {
            header: "Industry",
            render: r => <Text text={r.hte?.industry || "—"} />
        },
        {
            header: "Location",
            render: r => <HteLocation address={r.hte?.address || "—"} />
        },
        {
            header: "Contact Person",
            render: r => <Text text={r.hte?.contact_person || "—"} />
        },
        {
            header: "Expiry Date",
            render: r => (
                <Text
                    text={
                        r.expires_at
                            ? new Date(r.expires_at).toLocaleDateString()
                            : "—"
                    }
                />
            )
        },
        {
            header: "MOA Status",
            render: r => <Text text={r.status || "—"} />
        },
        {
            header: "View MOA",
            render: r => {
                const url = buildFileUrl(r.document_path);

                return url ? (
                    <ViewMoaButton
                        url={url}
                        onClick={() => {
                            openPdf(r.document_path);
                            console.log(`Path: ${r.document_path}`)
                        }}
                        onDownload={() =>
                            downloadMoa(r.document_path, r.hte?.company_name)
                        }
                    />
                ) : (
                    <Text text="—" />
                );
            }
        }
    ];

    const prospectMoaColumns = [
        {
            header: "Status",
            render: r => (
                <div className='w-30'>
                    <Dropdown 
                        value={r.status || "EMAILED_TO_HTE"}
                        placeholder="Set status"
                        currentValueColor={prospectStatusColors}
                        onChange={(value) => {
                                handleStatusChange(r.id, value);
                                setAction(value);
                                setLastStatus(r.status);
                                setSuccessModal(true);
                            }
                        }
                        disabled={
                            processingId === r.id ||
                            r.status === "APPROVED" ||
                            r.status === "CANCELLED"
                        }
                        categories={prospectStatusOptions}
                    />
                </div>
                
            )
        },   
        {
            header: "HTE Name",
            render: r => <Text text={r.company_name || "—"} />
        },
        {
            header: "Industry",
            render: r => <Text text={r.industry || "—"} />
        },
        {
            header: "Location",
            render: r => <HteLocation address={r.address || "—"} />
        },
        {
            header: "Contact Person",
            render: r => <Text text={r.contact_person || "—"} />
        },
        {
            header: "Position",
            render: r => <Text text={r.contact_position || "—"} />
        },
        {
            header: "Email",
            render: r => <Text text={r.contact_email || "—"} />
        },
        {
            header: "Contact Number",
            render: r => <Text text={r.contact_number || "—"} />
        },
        {
            header: "MOA File",
            render: r => {
                const url = buildFileUrl(r.moa_file_path);
                return url ? (
                    <ViewMoaButton
                        url={url}
                        onClick={() => {
                            openPdf(r.moa_file_path);
                            console.log(`Path: ${r.moa_file_path}`)
                        }}
                        onDownload={() =>
                            downloadMoa(r.moa_file_path, r.company_name)
                        }
                    />
                ) : (
                    <Text text="—" />
                );
            }
        }, 
        // {
        //     header: "Status",
        //     render: r => <Text text={formatProspectStatus(r.status)} />
        // },
    ];

    const activeFileName =
        activeFilter === "submissions"
            ? `${prospectMoas
                .find(m => buildFileUrl(m.moa_file_path) === filePdf)
                ?.company_name?.replace(/\s+/g, "_") || "HTE"}_MOA.pdf`
            : `${currentMoas
                .find(m => buildFileUrl(m.document_path) === filePdf)
                ?.hte?.company_name?.replace(/\s+/g, "_") || "HTE"}_MOA.pdf`;

    return (
        <AdminScreen>
            {successModal &&
                <GeneralPopupModal
                    title={`Status changed`}
                    text={`Status set from ${lastStatus} to ${action}`}
                    onClose={() => setSuccessModal(false)}
                    isSuccess
                />
            }
            <ViewModal
                visible={openView}
                onClose={() => setOpenView(false)}
                isDocument={true}
                resourceTitle="MOA File"
                file={filePdf}
                filename={activeFileName}
            />
            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="MOA Overview and Submissions" size='text-[2rem]'/>
                <Subtitle text={"Overview MOA Information and set status to MOA Prospect Submissions"}/>
            </div>

            <div className='flex flex-row gap-3 w-[90%]'>
                <Subtitle
                    text="MOA Overview"
                    onClick={() => setFilter("overview")}
                    isActive={activeFilter === "overview"}
                    isLink
                    weight={"font-bold"}
                    size="text-[1rem]"
                    className={"rounded-2xl"}
                />
                <Subtitle text="|" size="text-[1rem]" />
                <Subtitle
                    text="MOA Prospect Submissions"
                    onClick={() => setFilter("submissions")}
                    isActive={activeFilter === "submissions"}
                    isLink
                    weight={"font-bold"}
                    size="text-[1rem]"
                    className={"rounded-2xl"}
                />
            </div>

            {activeFilter === "overview" && (
                <>
                    <OasisTable
                        columns={currentMoaColumns}
                        data={currentMoas}
                    />
                </>
            )}

            {activeFilter === "submissions" && (
                <>
                    {loadingProspects ? (
                        <div className="w-[80%]">
                            <Subtitle text="Loading MOA prospect submissions..." />
                        </div>
                    ) : (
                        <OasisTable
                            columns={prospectMoaColumns}
                            data={prospectMoas}
                        />
                    )}
                </>
            )}


        </AdminScreen>
    );
}