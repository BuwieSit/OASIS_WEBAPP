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

    // const handleAdviserChange = (studentId, adviserId) => {
    //     setStudents(prev =>
    //         prev.map(student =>
    //             student.id === studentId
    //                 ? { ...student, studentAdviserId: adviserId }
    //                 : student
    //         )
    //     );

    //     console.log(`Mock assign adviser ${adviserId} to student ${studentId}`);
    // };


    const regStudents = [
        
        {header: "Name", render: row => <Text text={row.studentName}/>},
        {header: "Section", render: row => <Text text={row.studentSection}/>},
        {header: "Student Webmail", render: row => <Text text={row.studentWebmail}/>},
        {header: "Program", render: row => <Text text={row.studentProgram}/>},
        {header: "OJT Adviser", render: row => <Text text={row.studentAdviser}/>},
        {header: "Actions", render: row => <ActionButtons rowId={row.id}/>},
        
    ]

    return(
        <>
            <AdminScreen>
                <div className=''>
                    <Title text={"Registered Students"}/>
                </div>
                <OasisTable columns={regStudents} data={students}>
                    <Title text={"Filter by year"}/>
                    <div className="flex flex-row items-center justify-start gap-5 mt-5">
                        <Filter text={"All"}/>
                        <Filter text={"2nd year"}/>
                        <Filter text={"3rd year"}/>
                    </div>
                </OasisTable>
            </AdminScreen>
        </>
    )
}