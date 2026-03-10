import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    ViewMoaButton
} from "../../utilities/tableUtil.jsx";
import { ViewModal } from '../../components/popupModal';
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { useEffect, useState } from 'react';
import Subtitle from '../../utilities/subtitle.jsx';
import { AdminAPI } from "../../api/admin.api";

export default function MoaOverview() {
    const [activeFilter, setFilter] = useQueryParam("tab", "overview");

    const [currentMoas, setCurrentMoas] = useState([]);
    const [prospectMoas, setProspectMoas] = useState([]);

    const [openView, setOpenView] = useState(false);
    const [filePdf, setFilePdf] = useState(null);
    const [loadingProspects, setLoadingProspects] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL;

    const prospectStatusOptions = [
        "EMAILED_TO_HTE",
        "FOR_SIGNATURE",
        "ULCO",
        "RETRIEVED_FROM_ULCO",
        "APPROVED",
        "CANCELLED",
    ];

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
                        onClick={() => openPdf(r.document_path)}
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
            header: "Status",
            render: r => <Text text={formatProspectStatus(r.status)} />
        },
        {
            header: "MOA File",
            render: r => {
                const url = buildFileUrl(r.moa_file_path);
                return url ? (
                    <ViewMoaButton
                        url={url}
                        onClick={() => openPdf(r.moa_file_path)}
                        onDownload={() =>
                            downloadMoa(r.moa_file_path, r.company_name)
                        }
                    />
                ) : (
                    <Text text="—" />
                );
            }
        },
        {
            header: "Actions",
            render: r => (
                <select
                    className="border rounded-md px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={r.status || "EMAILED_TO_HTE"}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    disabled={
                        processingId === r.id ||
                        r.status === "APPROVED" ||
                        r.status === "CANCELLED"
                    }
                >
                    {prospectStatusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status === "CANCELLED" ? "REJECTED" : status}
                        </option>
                    ))}
                </select>
            )
        }
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
            <div className='flex flex-row gap-3 w-[80%]'>
                <Subtitle
                    text="MOA Overview"
                    onClick={() => setFilter("overview")}
                    isActive={activeFilter === "overview"}
                    isLink
                    size="text-[1rem]"
                />
                <Subtitle text="|" size="text-[1rem]" />
                <Subtitle
                    text="MOA Prospect Submissions"
                    onClick={() => setFilter("submissions")}
                    isActive={activeFilter === "submissions"}
                    isLink
                    size="text-[1rem]"
                />
            </div>

            {activeFilter === "overview" && (
                <>
                    <div className='flex justify-start items-start w-[80%]'>
                        <Title text="MOA Overview" />
                    </div>

                    <OasisTable
                        columns={currentMoaColumns}
                        data={currentMoas}
                    />
                </>
            )}

            {activeFilter === "submissions" && (
                <>
                    <div className='flex justify-start items-start w-[80%]'>
                        <Title text="MOA Prospect Submissions" />
                    </div>

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

            <ViewModal
                visible={openView}
                onClose={() => setOpenView(false)}
                isDocument={true}
                resourceTitle="MOA File"
                file={filePdf}
                filename={activeFileName}
            />
        </AdminScreen>
    );
}