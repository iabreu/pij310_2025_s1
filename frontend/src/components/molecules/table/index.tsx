import { Button } from "@/components/ui/button"
import { Patient, patientService } from "@/services/api"
import { PlusIcon } from 'lucide-react'
import { useState } from "react"
import { Input } from "@/components/ui/input"

import Modal from "../modal"
import Row from "./row"

type TableProps = {
  title: string
  columns: string[]
  rows: Patient[]
  getPatients: () => void
}
const Table = ({ title, columns, rows, getPatients }: TableProps) => {
  const [newPatientModal, setNewPatientModal] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(rows)

  const handleFilter = () => {
    if (searchTerm === "") {
      setFilteredPatients(rows)
    } else {
      const filtered = rows.filter((patient) =>
        patient.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trim())
    handleFilter()
  }

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Input
            id='searchPatient'
            type="string"
            placeholder="Buscar por ID"
            className="h-9 py-1"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button variant="outline" size="sm" className="text-sm" onClick={() => setNewPatientModal(true)}>
            <PlusIcon className="w-4 mr-1" />Novo paciente
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {columns.map((column, index: number) => (
                  <th
                    className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm"
                    key={index}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ?
                filteredPatients.map((row, index) => {
                  const colors = ["bg-neutral-700/10", "bg-neutral-700/30"];
                  const rowColor = colors[index % colors.length];
                  return (
                    <Row
                      patientData={row}
                      key={index}
                      rowColor={rowColor}
                    />
                  )
                })
                :
                <tr
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10"
                >
                  <td className="py-3 px-4 w-auto">
                    <span>Sem dados</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      {newPatientModal ?
        <Modal.NewPatient
          newPatientModal={newPatientModal}
          setNewPatientModal={setNewPatientModal}
          getPatients={getPatients}
        />
        : null}
    </div>
  )
}

export default Table