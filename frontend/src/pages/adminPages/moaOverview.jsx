import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    ActionButtons,
    ViewMoaButton
} from "../../utilities/tableUtil.jsx";
import PdfViewer from "../../utilities/pdfViewer";
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
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    /* ============================
       FETCH DATA
    ============================ */
    useEffect(() => {
        if (activeFilter === "overview") {
            AdminAPI.getMoas()
                .then(res => {
                    console.log("RAW MOA RESPONSE:", res.data);
                    setCurrentMoas(res.data);
                })
                .catch(console.error);
        }
    }, [activeFilter]);

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
            render: r =>
                r.document_path ? (
                    <ViewMoaButton
                        url={`${import.meta.env.VITE_API_BASE_URL}/api/files/${r.document_path.replace("uploads/", "")}`}
                    />
                ) : (
                    <Text text="—" />
                )
        }
    ];

    /* ============================
       COLUMNS – MOA PROSPECTS
    ============================ */
    const prospectMoaColumns = [
        {
            header: "HTE Name",
            render: r => <Text text={r.hte_name || "—"} />
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
            render: r =>
                r.moa_file ? (
                    <ViewMoaButton
                        onClick={() => {
                            setFilePdf(
                                `${import.meta.env.VITE_API_BASE_URL}/api/files/${r.document_path.replace("uploads/", "")}`
                            );
                            setOpenView(true);
                        }}
                    />
                ) : (
                    <Text text="—" />
                )
        },
        {
            header: "Actions",
            render: r => <ActionButtons rowId={r.id} />
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
            >
                <PdfViewer file={filePdf} />
            </ViewModal>

        </AdminScreen>
    );
}