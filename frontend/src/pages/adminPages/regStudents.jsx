import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from "../../components/oasisTable.jsx";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import {
  Text,
  ActionButtons,
} from "../../utilities/tableUtil.jsx";
import Subtitle from '../../utilities/subtitle.jsx';
import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/admin.api";

export default function RegStudents() {

  const [students, setStudents] = useState([]);
  const [activeFilter, setFilter] = useQueryParam("tab", "");

  useEffect(() => {
    const program = activeFilter ? activeFilter.toUpperCase() : "";

    AdminAPI.getStudents(program)
      .then(res => setStudents(res.data))
      .catch(err => {
        console.error("Failed to fetch students", err);
        setStudents([]);
      });
  }, [activeFilter]);

  const regStudents = [
    { header: "Name", render: row => <Text text={row.name} /> },
    { header: "Student Webmail", render: row => <Text text={row.email} /> },
    { header: "Program", render: row => <Text text={row.program || "—"} /> },
    { header: "OJT Adviser", render: row => <Text text={row.ojt_adviser || "—"} /> },
    { header: "Actions", render: row => <ActionButtons rowId={row.id} /> },
  ];

  return (
    <AdminScreen>
      <Title text="Registered Students" />

      <OasisTable columns={regStudents} data={students}>
        <Title text="Filter by program" />

        <div className="flex flex-row items-center justify-start gap-5 mt-5">
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
        </div>
      </OasisTable>
    </AdminScreen>
  );
}
