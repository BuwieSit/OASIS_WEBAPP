import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    ViewMoaButton
} from "../../utilities/tableUtil.jsx";
import { GeneralPopupModal, ViewModal } from '../../components/popupModal';
import HteDetailModal from '../../components/HteDetailModal.jsx';
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { useEffect, useState, useMemo } from 'react';
import Subtitle from '../../utilities/subtitle.jsx';
import { AdminAPI } from "../../api/admin.api";
import { Dropdown } from '../../components/adminComps.jsx';
import SearchBar from '../../components/searchBar.jsx';

export default function MoaOverview() {
    const [activeFilter, setFilter] = useQueryParam("tab", "overview");

    const [currentMoas, setCurrentMoas] = useState([]);
    const [prospectMoas, setProspectMoas] = useState([]);
    const [search, setSearch] = useState("");
    const [openView, setOpenView] = useState(false);
    const [filePdf, setFilePdf] = useState(null);
    const [currentFileName, setCurrentFileName] = useState("HTE_MOA.pdf");
    const [loadingProspects, setLoadingProspects] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const [popup, setPopup] = useState(null);

    const [selectedHte, setSelectedHte] = useState(null);

    const filteredCurrentMoas = useMemo(() => {
        if (!search) return currentMoas;
        const s = search.toLowerCase();
        return currentMoas.filter(m => 
            m.hte?.company_name?.toLowerCase().includes(s) ||
            m.hte?.industry?.toLowerCase().includes(s) ||
            m.hte?.address?.toLowerCase().includes(s) ||
            m.hte?.contact_person?.toLowerCase().includes(s) ||
            m.status?.toLowerCase().includes(s)
        );
    }, [currentMoas, search]);

    const filteredProspectMoas = useMemo(() => {
        if (!search) return prospectMoas;
        const s = search.toLowerCase();
        return prospectMoas.filter(m => 
            m.company_name?.toLowerCase().includes(s) ||
            m.industry?.toLowerCase().includes(s) ||
            m.address?.toLowerCase().includes(s) ||
            m.contact_person?.toLowerCase().includes(s) ||
            m.contact_email?.toLowerCase().includes(s) ||
            m.status?.toLowerCase().includes(s)
        );
    }, [prospectMoas, search]);

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
        FOR_SIGNATURE: "text-oasis-gray",
        ULCO: "text-oasis-header",
        RETRIEVED_FROM_ULCO: "text-oasis-button-light",
        APPROVED: "text-green-500",
        CANCELLED: "text-oasis-red"
    };

    useEffect(() => {
        if (activeFilter === "overview") {
            loadCurrentMoas();
        }

        if (activeFilter === "submissions") {
            loadProspects();
        }
    }, [activeFilter]);

    useEffect(() => {
        return () => {
            if (filePdf && filePdf.startsWith("blob:")) {
                window.URL.revokeObjectURL(filePdf);
            }
        };
    }, [filePdf]);

    const loadCurrentMoas = async () => {
        try {
            const res = await AdminAPI.getMoas();
            setCurrentMoas(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error("MOA overview fetch error:", err);
            setCurrentMoas([]);
        }
    };

    const loadProspects = async () => {
        try {
            setLoadingProspects(true);
            const res = await AdminAPI.getMoaProspects();
            setProspectMoas(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error("MOA prospects fetch error:", err);
            setProspectMoas([]);
        } finally {
            setLoadingProspects(false);
        }
    };

    const fetchMoaBlobUrl = async (moaId) => {
        if (!moaId) return null;

        try {
            const res = await AdminAPI.getMoaFileBlob(moaId);
            const blob = res?.data;

            if (!blob || blob.size === 0) {
                console.error("No blob returned for MOA:", moaId);
                return null;
            }

            return window.URL.createObjectURL(blob);
        } catch (err) {
            console.error("MOA file fetch failed:", err?.response?.data || err.message || err);
            return null;
        }
    };

    const openPdf = async (moaId, companyName) => {
        const blobUrl = await fetchMoaBlobUrl(moaId);
        if (!blobUrl) return;

        if (filePdf && filePdf.startsWith("blob:")) {
            window.URL.revokeObjectURL(filePdf);
        }

        const safeName = (companyName || "HTE")
            .replace(/\s+/g, "_")
            .replace(/[^\w\-]/g, "");

        setCurrentFileName(`${safeName}_MOA.pdf`);
        setFilePdf(blobUrl);
        setOpenView(true);
    };

    const downloadMoa = async (moaId, companyName) => {
        if (!moaId) return;

        try {
            const res = await AdminAPI.getMoaFileBlob(moaId);
            const blob = res?.data;

            if (!blob || blob.size === 0) {
                console.error("No blob returned for download:", moaId);
                return;
            }

            const safeName = (companyName || "HTE")
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

    const handleStatusChange = async (id, status, oldStatus) => {
        try {
            setProcessingId(id);
            await AdminAPI.updateMoaProspectStatus(id, status);
            await Promise.all([loadProspects(), loadCurrentMoas()]);
            setPopup({
                title: "Status Changed",
                text: `Status set from ${oldStatus} to ${status}`,
                type: "success"
            });
        } catch (err) {
            console.error("Update MOA prospect status failed:", err);
            setPopup({
                title: "Error",
                text: err?.response?.data?.message || err?.response?.data?.error || "Failed to update MOA prospect status.",
                type: "failed"
            });
        } finally {
            setProcessingId(null);
        }
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
            render: r => (
                <ViewMoaButton
                    url="#"
                    onClick={() => openPdf(r.id, r.hte?.company_name)}
                    onDownload={() => downloadMoa(r.id, r.hte?.company_name)}
                />
            )
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
                            handleStatusChange(r.id, value, r.status);
                        }}
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
                if (!r.id) return <Text text="—" />;

                return (
                    <ViewMoaButton
                        url="#"
                        onClick={() => openPdf(r.id, r.company_name)}
                        onDownload={() => downloadMoa(r.id, r.company_name)}
                    />
                );
            }
        },
    ];

    return (
        <AdminScreen>
            {popup && (
                <GeneralPopupModal
                    title={popup.title}
                    text={popup.text}
                    onClose={() => setPopup(null)}
                    isSuccess={popup.type === "success"}
                    isFailed={popup.type === "failed"}
                />
            )}

            <ViewModal
                visible={openView}
                onClose={() => {
                    if (filePdf && filePdf.startsWith("blob:")) {
                        window.URL.revokeObjectURL(filePdf);
                    }
                    setOpenView(false);
                    setFilePdf(null);
                }}
                isDocument={true}
                resourceTitle="MOA File"
                file={filePdf}
                filename={currentFileName}
            />

            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="MOA Overview and Submissions" size='text-[2rem]'/>
                <Subtitle text={"Overview MOA Information and set status to MOA Prospect Submissions"}/>
            </div>
            <div className='w-[90%] flex flex-row justify-end items-center z-70'>
                <SearchBar
                    value={search}
                    onChange={setSearch}
                />
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
                <OasisTable
                    columns={currentMoaColumns}
                    data={filteredCurrentMoas}
                    onRowClick={(row) => setSelectedHte(row.hte)}
                />
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
                            data={filteredProspectMoas}
                            onRowClick={(row) => setSelectedHte(row)}
                        />
                    )}
                </>
            )}

            <HteDetailModal
                visible={!!selectedHte}
                hte={selectedHte}
                onClose={() => setSelectedHte(null)}
            />
        </AdminScreen>
    );
}