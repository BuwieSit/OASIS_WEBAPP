import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    ActionButtons,
    ViewMoaButton
} from "../../utilities/tableUtil.jsx";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { useEffect, useState } from 'react';
import Subtitle from '../../utilities/subtitle.jsx';
import { AdminAPI } from "../../api/admin.api";

export default function MoaOverview() {

    const [activeFilter, setFilter] = useQueryParam("tab", "overview");

    const [currentMoas, setCurrentMoas] = useState([]);
    const [prospectMoas, setProspectMoas] = useState([]);

    /* ============================
       FETCH DATA
    ============================ */
    useEffect(() => {
        if (activeFilter === "overview") {
            AdminAPI.getMoas()
                .then(res => setCurrentMoas(res.data))
                .catch(console.error);
        }

        if (activeFilter === "submissions") {
            AdminAPI.getMoaProspects()
                .then(res => setProspectMoas(res.data))
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
            render: r => (
                <HteLocation address={r.hte?.address || "—"} />
            )
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
            header: "Action",
            render: r => <ActionButtons rowId={r.id} />
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
                r.moa_file
                    ? <ViewMoaButton url={r.moa_file} />
                    : <Text text="—" />
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

        </AdminScreen>
    );
}
