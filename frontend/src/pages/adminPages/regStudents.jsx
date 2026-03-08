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

export default function RegStudents() {
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [activeFilter, setFilter] = useQueryParam("tab", "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [activeFilter]);

  async function loadStudents() {
    try {
      setLoading(true);

      const program = activeFilter ? activeFilter.toUpperCase() : "";
      const res = await AdminAPI.getStudents({
        program,
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
    { header: "Name", render: row => <Text text={row.name} /> },
    { header: "Section", render: row => <Text text={row.section || "—"} /> },
    { header: "Student Webmail", render: row => <Text text={row.student_webmail || "—"} /> },
    { header: "Program", render: row => <Text text={row.program || "—"} /> },
    { header: "OJT Adviser", render: row => <Text text={row.ojt_adviser || "—"} /> },
    {
      header: "Actions",
      render: row => (
        <AnnounceButton
          btnText="Archive"
          onClick={() => handleArchive(row.id)}
        />
      ),
    },
  ];

  const archivedColumns = [
    { header: "Name", render: row => <Text text={row.name} /> },
    { header: "Section", render: row => <Text text={row.section || "—"} /> },
    { header: "Student Webmail", render: row => <Text text={row.student_webmail || "—"} /> },
    { header: "Program", render: row => <Text text={row.program || "—"} /> },
    { header: "OJT Adviser", render: row => <Text text={row.ojt_adviser || "—"} /> },
    {
      header: "Actions",
      render: row => (
        <AnnounceButton
          btnText="Unarchive"
          onClick={() => handleUnarchive(row.id)}
        />
      ),
    },
  ];

  return (
    <AdminScreen>
      <Title text="Registered Students" />

      <div className="w-full flex flex-col gap-10">
        <div>
          <Title text="Filter by program" />

          <div className="flex flex-row flex-wrap items-center justify-start gap-5 mt-5">
            {[
              "DIT",
              "DLMOT",
              "DEET",
              "DMET",
              "DCVET",
              "DCPET",
              "DRET",
              "DECET",
            ].map(code => (
              <Subtitle
                key={code}
                text={code}
                onClick={() => setFilter(code.toLowerCase())}
                isActive={activeFilter === code.toLowerCase()}
                isLink
                size="text-[1rem]"
              />
            ))}

            <Subtitle
              text="All"
              onClick={() => setFilter("")}
              isActive={activeFilter === ""}
              isLink
              size="text-[1rem]"
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Title text="Registered Students" />
          <OasisTable
            columns={registeredColumns}
            data={registeredStudents}
          >
            {loading && <Subtitle text="Loading registered students..." />}
          </OasisTable>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Title text="Archived Students" />
          <OasisTable
            columns={archivedColumns}
            data={archivedStudents}
          >
            {loading && <Subtitle text="Loading archived students..." />}
          </OasisTable>
        </div>
      </div>
    </AdminScreen>
  );
}