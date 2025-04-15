import { Button } from "@/components/ui/button"
import Row from "./row"
import { Patient } from "@/services/api"
import { PlusIcon } from 'lucide-react'
import { useState } from "react"
import Modal from "../modal"
import { DropdownMenu } from "@/components"

type TableProps = {
  title: string
  columns: string[]
  rows: Patient[]
}
const Table = ({ title, columns, rows }: TableProps) => {
  const [newPatientModal, setNewPatientModal] = useState<boolean>(false)

  const [openOptionMOdal, setOptionMOdal] = useState<boolean>(false)

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-sm" onClick={() => setNewPatientModal(true)}>
            <PlusIcon className="w-4 mr-1" />Novo paciente
          </Button>
          <Button variant="outline" size="sm" className="text-sm">
            Ver Todas
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
              {rows.length > 0 ? rows.map((row, index) => (
                <Row
                  name={row.name}
                  nick={row.id}
                  status={row.taxpayer_number}
                  time={row.diagnosis_date}
                  key={index}
                />
              )) :
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
      {newPatientModal ? <Modal.NewPatient newPatientModal={newPatientModal} setNewPatientModal={setNewPatientModal} /> : null}
    </div>
  )
}

export default Table