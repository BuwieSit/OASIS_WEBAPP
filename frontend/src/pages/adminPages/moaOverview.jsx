import { Link } from 'react-router-dom'

import AdminScreen from '../../layouts/adminScreen.jsx';
import { AdminHeader } from '../../components/headers.jsx'
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import {
    Text,
    HteLocation,
    StatusDropdown,
    ActionButtons,
    ViewMoaButton
} from "../../utilities/tableUtil.jsx";

export default function MoaOverview() {

    const currentMoaColumns = [
        { header: "HTE Name", render: row => <Text text={row.hteName} /> },
        { header: "Industry", render: row => <Text text={row.industry} /> },
        { header: "Location", render: row => <HteLocation address={row.location} /> },
        { header: "Contact Person", render: row => <Text text={row.contactPerson} /> },
        { header: "Expiry Date", render: row => <Text text={row.expiryDate} /> },
        { header: "MOA Status", render: row => <StatusDropdown value={row.status} /> },
        { header: "Actions", render: row => <ActionButtons rowId={row.id} /> }
    ];
    // MOCK DATA
    const currentMoasData = [
        {
            id: 1,
            hteName: "KSILVER Inc.",
            industry: "IT Services",
            location: "Quezon City",
            contactPerson: "Juan Dela Cruz",
            expiryDate: "Dec 12, 2026",
        }
    ];

    const prospectMoaColumns = [
        { header: "HTE Name", render: row => <Text text={row.hteName} /> },
        { header: "Industry", render: row => <Text text={row.industry} /> },
        { header: "Location", render: row => <HteLocation address={row.location} /> },
        { header: "Contact Person", render: row => <Text text={row.contactPerson} /> },
        { header: "Expiry Date", render: row => <Text text={row.expiryDate} /> },
        { header: "Contact Number", render: row => <Text text={row.contactNumber} /> },
        { header: "MOA File", render: row => <ViewMoaButton url={row.moaFile} /> },
        { header: "Actions", render: row => <ActionButtons rowId={row.id} /> }
    ];
// MOCK DATA
    const prospectMoaData = [
        {
            id: 1,
            hteName: "KSILVER Inc.",
            industry: "IT Services",
            location: "Quezon City",
            contactPerson: "Juan Dela Cruz",
            expiryDate: "Dec 12, 2026",
            contactPerson: "Bogart Rodriguez",
            contactNumber: "09512362344",
            moaFile: "www.youtube.com"
        }
    ];
  
    return(
        <>
            <AdminScreen>
                <AdminHeader/>
                <div className=''>
                    <Title text={"MOA Overview"}/>
                </div>

                <OasisTable columns={currentMoaColumns} data={currentMoasData}/>

                <div className='flex justify-start items-start w-[90%]'>
                    <Title text={"MOA Prospects Submissions"}/>
                </div>

                <OasisTable columns={prospectMoaColumns} data={prospectMoaData}/>

            </AdminScreen>
        </>
    )
}