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

                    {/* <CoursesButton text="DIT" />
                    <CoursesButton text="DLMOT" />
                    <CoursesButton text="DEET" />
                    <CoursesButton text="DMET" />
                    <CoursesButton text="DCvET" />
                    <CoursesButton text="DCpET" />
                    <CoursesButton text="DRET" />
                    <CoursesButton text="DECET" /> */}
                </OasisTable>
            </AdminScreen>
        </>
    )
}