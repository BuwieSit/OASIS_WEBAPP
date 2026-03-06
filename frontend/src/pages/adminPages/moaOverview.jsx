import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    ActionButtons,
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

    const API_BASE = import.meta.env.VITE_API_URL;

    /* ============================
       FETCH DATA
    ============================ */
    useEffect(() => {
        // MOA Overview
        if (activeFilter === "overview") {
            AdminAPI.getMoas()
                .then(res => {
                    setCurrentMoas(res.data || []);
                })
                .catch(err => {
                    console.error("MOA overview fetch error:", err);
                    setCurrentMoas([]);
                });
        }

        // MOA Prospect Submissions
        if (activeFilter === "submissions") {
            AdminAPI.getMoaProspects()
                .then(res => {
                    setProspectMoas(res.data || []);
                })
                .catch(err => {
                    console.error("MOA prospects fetch error:", err);
                    setProspectMoas([]);
                });
        }
    }, [activeFilter]);

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
        console.log("Original filePath:", filePath);
        const url = buildFileUrl(filePath);
        console.log("Built URL:", url);
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

            const safeName = companyName
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

    /* ============================
       COLUMNS – EXISTING MOAs
    ============================ */
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

    /* ============================
       COLUMNS – MOA PROSPECTS
       (Actions: do nothing yet)
    ============================ */
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
                        onClick={() => openPdf(r.moa_file_path)}
                    />
                ) : (
                    <Text text="—" />
                );
            }
        },
        {
            header: "Actions",
            render: r => <ActionButtons onReject rowId={r.id} />
        }
    ];

    return (
        <AdminScreen>

            {/* ============================
               TABS
            ============================ */}
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

            {/* ============================
               EXISTING MOAs
            ============================ */}
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

            {/* ============================
               MOA PROSPECTS
            ============================ */}
            {activeFilter === "submissions" && (
                <>
                    <div className='flex justify-start items-start w-[80%]'>
                        <Title text="MOA Prospect Submissions" />
                    </div>

                    <OasisTable
                        columns={prospectMoaColumns}
                        data={prospectMoas}
                    />
                </>
            )}

            {/* ============================
               VIEW MOA MODAL
            ============================ */}
            <ViewModal
                visible={openView}
                onClose={() => setOpenView(false)}
                isDocument={true}
                resourceTitle="MOA File"
                file={filePdf}
                filename={`${currentMoas.find(m => buildFileUrl(m.document_path) === filePdf)?.hte?.company_name?.replace(/\s+/g,"_") || "HTE"}_MOA.pdf`}
            />

        </AdminScreen>
    );
}