import { Button } from "@/components/ui/button";
import { Patient, patientService } from "@/services/api";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

import Modal from "../modal";
import Row from "./row";

type TableProps = {
  title: string;
  columns: string[];
  rows: Patient[];
  getPatients: () => void;
};
const Table = ({ title, columns, rows, getPatients }: TableProps) => {
  const [newPatientModal, setNewPatientModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(rows);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSearchTerm(value);

    if (value === "") {
      setFilteredPatients(rows);
    } else {
      const filtered = rows.filter((patient) =>
        patient.medical_record_number
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 px-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-neutral-800 z-10 pb-4 pt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Input
              id="searchPatient"
              type="string"
              placeholder="Buscar por ID"
              className="h-9 py-1"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => setNewPatientModal(true)}
            >
              <PlusIcon className="w-4 mr-1" />
              Novo paciente
            </Button>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse mb-4">
        <thead className="sticky top-[68px] bg-white dark:bg-neutral-800 z-10">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((column, index: number) => (
              <th
                key={index}
                className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((row, index) => {
              const colors = ["bg-neutral-700/10", "bg-neutral-700/30"];
              const rowColor = colors[index % colors.length];
              return (
                <Row
                  key={index}
                  patientData={row}
                  rowColor={rowColor}
                  refetch={getPatients}
                  showTiter={true}
                />
              );
            })
          ) : (
            <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10">
              <td className="py-3 px-4 w-auto">
                <span>Sem dados</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {newPatientModal && (
        <Modal.NewPatient
          newPatientModal={newPatientModal}
          setNewPatientModal={setNewPatientModal}
          getPatients={getPatients}
        />
      )}
    </div>
  );
};

export default Table;
