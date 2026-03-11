import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from "../../components/oasisTable.jsx";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import {
  Text,
} from "../../utilities/tableUtil.jsx";
import Subtitle from '../../utilities/subtitle.jsx';
import { useEffect, useState } from 'react';
import { AdminAPI } from "../../api/admin.api";
import { AnnounceButton } from '../../components/button.jsx';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';

export default function RegStudents() {
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [activeFilter, setFilter] = useQueryParam("tab", "All");
  const [activeTable, setActiveTable] = useState("registered");
  const [loading, setLoading] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmUnarchive, setConfirmUnarchive] = useState(false);
  const [studentToArchive, setStudentToArchive] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [action, setAction] = useState("");
  const sectionCodes = [
    "DIT",
    "DLMOT",
    "DEET",
    "DMET",
    "DCVET",
    "DCPET",
    "DRET",
    "DECET",
  ]
  useEffect(() => {
    loadStudents();
  }, [activeFilter]);

  async function loadStudents() {
    try {
      setLoading(true);

      const normalizedFilter = activeFilter === "All" ? "" : activeFilter.toUpperCase();

      const res = await AdminAPI.getStudents({
        program: normalizedFilter,
      });

      setRegisteredStudents(res?.data?.registered || []);
      setArchivedStudents(res?.data?.archived || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
      setRegisteredStudents([]);
      setArchivedStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(studentId) {
    try {
      await AdminAPI.archiveStudent(studentId);
      await loadStudents();
    } catch (err) {
      console.error("Failed to archive student", err);
    }
  }

  async function handleUnarchive(studentId) {
    try {
      await AdminAPI.unarchiveStudent(studentId);
      await loadStudents();
    } catch (err) {
      console.error("Failed to unarchive student", err);
    }
  }

  const registeredColumns = [
    { header: "Name", render: row => <Text text={row.name || "—"} /> },
    { header: "Section", render: row => <Text text={row.studentSection || row.section || "—"} /> },
    { header: "Student Webmail", render: row => <Text text={row.email || row.student_webmail || "—"} /> },
    { header: "Program", render: row => <Text text={row.program || "—"} /> },
    { header: "OJT Adviser", render: row => <Text text={row.ojt_adviser || "—"} /> },
    {
      header: "Actions",
      render: row => (
        <AnnounceButton
          btnText="Archive"
          onClick={() => {
            setStudentToArchive(row);
            setConfirmArchive(true); 
          }}
        />
      ),
    },
  ];

  const archivedColumns = [
    { header: "Name", render: row => <Text isGray={true} text={row.name || "—"} /> },
    { header: "Section", render: row => <Text isGray={true} text={row.studentSection || row.section || "—"} /> },
    { header: "Student Webmail", render: row => <Text isGray={true} text={row.email || row.student_webmail || "—"} /> },
    { header: "Program", render: row => <Text isGray={true} text={row.program || "—"} /> },
    { header: "OJT Adviser", render: row => <Text isGray={true} text={row.ojt_adviser || "—"} /> },
    {
      header: "Actions",
      render: row => (
        <AnnounceButton
          btnText="Unarchive"
          onClick={() => {
            setStudentToArchive(row);
            setConfirmUnarchive(true); 
          }}
        />
      ),
    },
  ];

  return (
    <AdminScreen>
      {confirmArchive && studentToArchive &&
        <ConfirmModal 
          confText={`archive ${studentToArchive.name}?`}
          onConfirm={() => 
              {
                handleArchive(studentToArchive.id);
                setConfirmArchive(false);
                setShowSuccess(true);
                setAction("archived");
              }
            }
          onCancel={() => setConfirmArchive(false)}
        />
      }

      {confirmUnarchive && studentToArchive &&
        <ConfirmModal 
          confText={`unarchive ${studentToArchive.name}?`}
          onConfirm={() => 
              {
                handleUnarchive(studentToArchive.id);
                setConfirmUnarchive(false);
                setShowSuccess(true);
                setAction("unarchived");
              }
            }
          onCancel={() => setConfirmUnarchive(false)}
        />
      }

      {showSuccess && studentToArchive && (
          <GeneralPopupModal 
            title={`Student ${action}`}
            text={`${studentToArchive.name} successfully ${action}.`}
            onClose={() => setShowSuccess(false)}
            time={3000}
            isSuccess
          />
      )}
      <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
        <Title text="Students Overview" size='text-[2rem]'/>
        <Subtitle text={"Oversee and Archive Registered Students."}/>
      </div>
 

      <div className="w-full flex flex-col gap-10 justify-center items-center">
        <div className='flex justify-start items-center w-[90%] gap-5 border-b border-gray-400 pb-5'>
            <div className='flex justify-start items-center w-full gap-5'>
                <Subtitle
                  text="Registered Students"
                  onClick={() => setActiveTable("registered")}
                  isActive={activeTable === "registered"}
                  isLink
                  size="text-[1.1rem]"
                  weight={"font-bold"}
                  className={"rounded-2xl"}
                />
                <Subtitle
                  text="Archived Students"
                  onClick={() => setActiveTable("archived")}
                  isActive={activeTable === "archived"}
                  isLink
                  size="text-[1.1rem]"
                  weight={"font-bold"}
                  className={"rounded-2xl"}
                />

            </div>
        </div>

        

        <div className="w-full flex flex-col gap-4 justify-center items-center">
          {activeTable === "registered" && 
            <>
              <div className='w-[80%] flex justify-start items-start'>
                <Subtitle size={"text-table-text-size"} text={"Filter by program:"}/>
              </div>

              <div className='flex justify-start items-start w-[80%] gap-5'>
                  <Subtitle
                    text="All"
                    onClick={() => setFilter("All")}
                    isActive={activeFilter === "All"}
                    isLink
                    size="text-[1rem]"
                    className={"border rounded-2xl"}
                    weight={"font-bold"}
                    
                  />
                  {sectionCodes.map(code => (
                    <Subtitle
                      key={code}
                      text={code}
                      onClick={() => setFilter(code.toLowerCase())}
                      isActive={activeFilter === code.toLowerCase()}
                      isLink
                      size="text-[1rem]"
                      className={"border rounded-2xl"}
                      weight={"font-bold"}
                      
                    />
                  ))}
              </div>
              <OasisTable 
                columns={registeredColumns}
                data={registeredStudents}
              >
                {loading && <Subtitle text="Loading registered students..." />}
              </OasisTable>
            </>
          }

          {activeTable === "archived" && 
            <>
              <div className='w-[80%] flex justify-start items-start'>
                <Subtitle size={"text-table-text-size"} text={"Filter by program:"}/>
              </div>
              <div className='flex justify-start items-start w-[80%] gap-5'>
                  <Subtitle
                    text="All"
                    onClick={() => setFilter("All")}
                    isActive={activeFilter === "All"}
                    isLink
                    size="text-[1rem]"
                    className={"border rounded-2xl"}
                    weight={"font-bold"}
                    
                  />
                  {sectionCodes.map(code => (
                    <Subtitle
                      key={code}
                      text={code}
                      onClick={() => setFilter(code.toLowerCase())}
                      isActive={activeFilter === code.toLowerCase()}
                      isLink
                      size="text-[1rem]"
                      className={"border rounded-2xl"}
                      weight={"font-bold"}
                    />
                  ))}
              </div>
              <OasisTable
                columns={archivedColumns}
                data={archivedStudents}
              >
                {loading && <Subtitle text="Loading archived students..." />}
              </OasisTable>
            </>
          }
        
        </div>




      </div>
    </AdminScreen>
  );
}