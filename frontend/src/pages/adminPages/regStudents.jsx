import { Link } from 'react-router-dom';
import { useState } from 'react';
import AdminScreen from '../../layouts/adminScreen.jsx';
import { AdminHeader } from '../../components/headers.jsx'
import Title from "../../utilities/title.jsx";
import OasisTable from "../../components/oasisTable.jsx"

import { Filter } from '../../components/adminComps.jsx';
import {
    Text,
    ActionButtons,
    AdviserDropdown
} from "../../utilities/tableUtil.jsx";


export default function RegStudents() {
    // MOCK DATA
    const advisers = [
        { id: 1, name: "Prof. Maria Santos" },
        { id: 2, name: "Engr. John Reyes" },
        { id: 3, name: "Dr. Ana Cruz" },
        { id: 4, name: "Mr. Carlo Mendoza" }
    ]

    const [students, setStudents] = useState([
        {
            id: 1,
            studentName: "Juan Dela Cruz",
            studentWebmail: "juan@school.edu.ph",
            studentYear: "2nd Year",
            studentAdviserId: 1
        },
        {
            id: 2,
            studentName: "Ana Lim",
            studentWebmail: "ana@school.edu.ph",
            studentYear: "3rd Year",
            studentAdviserId: 1
        }
    ])

    const handleAdviserChange = (studentId, adviserId) => {
        setStudents(prev =>
            prev.map(student =>
                student.id === studentId
                    ? { ...student, studentAdviserId: adviserId }
                    : student
            )
        );

        console.log(`Mock assign adviser ${adviserId} to student ${studentId}`);
    };


    const regStudents = [
        
        {header: "Name", render: row => <Text text={row.studentName}/>},
        {header: "Student Webmail", render: row => <Text text={row.studentWebmail}/>},
        {header: "Year", render: row => <Text text={row.studentYear}/>},
        {header: "OJT Adviser", render: row => (
                                        <AdviserDropdown 
                                            value={row.studentAdviserId}
                                            options={advisers}
                                            onChange={(adviserId) => {
                                                handleAdviserChange(row.id, adviserId)
                                            }}
                                            />
                                    )},
        {header: "Actions", render: row => <ActionButtons rowId={row.id}/>},
        
    ]

    return(
        <>
            <AdminScreen>
                <AdminHeader/>
                <div className=''>
                    <Title text={"Registered Students"}/>
                </div>
                <OasisTable columns={regStudents} data={students}>
                    <Title text={"Filter by year"}/>
                    <div className="flex flex-row items-center justify-start gap-5">
                        <Filter text={"All"}/>
                        <Filter text={"2nd year"}/>
                        <Filter text={"3rd year"}/>
                    </div>
                </OasisTable>
            </AdminScreen>
        </>
    )
}