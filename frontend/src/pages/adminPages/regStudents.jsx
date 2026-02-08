import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from "../../components/oasisTable.jsx";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import {
    Text,
    ActionButtons,
    AdviserDropdown
} from "../../utilities/tableUtil.jsx";
import Subtitle from '../../utilities/subtitle.jsx';
import { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';

const API_BASE = api.defaults.baseURL;

export default function RegStudents() {
    // MOCK DATA

    const students = [
        {
            id: 1,
            studentName: "Juan Dela Cruz",
            studentSection: "3-1",
            studentWebmail: "juan@school.edu.ph",
            studentProgram: "DIT",
            studentAdviser: "Prof. Juan Dela Cruz",
        },
        {
            id: 2,
            studentName: "Ana Lim",
            studentSection: "3-1",
            studentWebmail: "ana@school.edu.ph",
            studentProgram: "DIT",
            studentAdviser: "Prof. Juan Dela Cruz",
        }
    ]

    const regStudents = [
        
        {header: "Name", render: row => <Text text={row.studentName}/>},
        {header: "Section", render: row => <Text text={row.studentSection}/>},
        {header: "Student Webmail", render: row => <Text text={row.studentWebmail}/>},
        {header: "Program", render: row => <Text text={row.studentProgram}/>},
        {header: "OJT Adviser", render: row => <Text text={row.studentAdviser}/>},
        {header: "Actions", render: row => <ActionButtons rowId={row.id}/>},
        
    ]
    
    // const [students, setStudents] = useState([]);
    // const [user, setUser] = useState(null);
    // const [profile, setProfile] = useState(null);

    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             // ---- PROFILE ----
    //             const res = await api.get("/api/admin/me");
    //             const fetchedProfile = res.data.profile;

    //             fetchedProfile.photo_url = fetchedProfile.photo_path
    //                 ? `${API_BASE}${fetchedProfile.photo_path}`
    //                 : null;

    //             setUser(res.data.user);
    //             setProfile(fetchedProfile);

    //             // ---- STUDENTS LIST ----
    //             const studentsRes = await api.get("/api/admin/me");
    //             setStudents(studentsRes.data); 
    //         } catch (err) {
    //             console.error("Failed to fetch data:", err);
    //         }
    //     }

    //     fetchData();
    // }, []);

    // if (!user || !profile) return null;
    
    const [activeFilter, setFilter] = useQueryParam("tab", "overview");
    return(
        <>
            <AdminScreen>
                <div className=''>
                    <Title text={"Registered Students"}/>
                </div>
                <OasisTable columns={regStudents} data={students}>
                    <Title text={"Filter by year"}/>
                    <div className="flex flex-row items-center justify-start gap-5 mt-5">
                        <Subtitle
                            text={"DIT"}
                            onClick={() => setFilter("dit")}
                            isActive={activeFilter === "dit"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DLMOT"}
                            onClick={() => setFilter("dlmot")}
                            isActive={activeFilter === "dlmot"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DEET"}
                            onClick={() => setFilter("deet")}
                            isActive={activeFilter === "deet"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DMET"}
                            onClick={() => setFilter("dmet")}
                            isActive={activeFilter === "dmet"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DCVET"}
                            onClick={() => setFilter("dcvet")}
                            isActive={activeFilter === "dcvet"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DCPET"}
                            onClick={() => setFilter("dcpet")}
                            isActive={activeFilter === "dcpet"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DRET"}
                            onClick={() => setFilter("dret")}
                            isActive={activeFilter === "dret"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text={"DECET"}
                            onClick={() => setFilter("decet")}
                            isActive={activeFilter === "decet"}
                            isLink={true}
                            size='text-[1rem]'
                        />
                    </div>

                </OasisTable>
            </AdminScreen>
        </>
    )
}


   
