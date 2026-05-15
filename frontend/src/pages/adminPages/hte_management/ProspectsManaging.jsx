import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AdminAPI } from '../../../api/admin.api';
import Title from '../../../utilities/title.jsx';
import Subtitle from '../../../utilities/subtitle.jsx';
import OasisTable from '../../../components/oasisTable.jsx';
import { Dropdown } from '../../../components/adminComps.jsx';
import { Text, ViewMoaButton } from '../../../utilities/tableUtil.jsx';

export default function ProspectsManaging({ search, setPopup, openPdf, downloadMoa, viewingId, onRowClick }) {
    const queryClient = useQueryClient();

    const { data: prospects = [], isLoading: prospectsLoading } = useQuery({
        queryKey: ['adminMoaProspects'],
        queryFn: AdminAPI.getMoaProspects,
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

    const prospectStatusColors = { 
        EMAILED_TO_HTE: "text-oasis-aqua", 
        FOR_SIGNATURE: "text-oasis-gray", 
        ULCO: "text-oasis-header", 
        RETRIEVED_FROM_ULCO: "text-oasis-button-light", 
        APPROVED: "text-green-500", 
        CANCELLED: "text-oasis-red" 
    };
    
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

    return (
        <div className="w-full flex flex-col items-center animate__animated animate__fadeIn">
            <div className='flex justify-start items-start w-[90%] mb-5 border-b border-gray-200 pb-3'>
                <Title text={"MOA Prospect Submissions"} />
            </div>
            {prospectsLoading ? (
                <Subtitle text="Loading..." />
            ) : (
                <OasisTable columns={prospectColumns} data={filteredProspects} onRowClick={onRowClick} />
            )}
        </div>
    );
}
