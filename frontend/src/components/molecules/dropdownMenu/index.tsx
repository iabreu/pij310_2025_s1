import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { patientService } from "@/services/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Edit, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from "react";
import Modal from "../modal";

type ModalProps = {
  row: number
};


const TableOption = ({ row }: ModalProps) => {
  const [isHandleLoading, setIshandleLoading] = useState<boolean>(false)
  const [editPatientModal, setEditPatientModal] = useState<boolean>(false)
  const [deletePatientModal, setDeletePatientModal] = useState<boolean>(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="flex flex-col bg-zinc-700 rounded-md overflow-hidden shadow-md text-sm w-40"
      >
        <DropdownMenuItem
          onClick={() => setEditPatientModal(true)}
          disabled={isHandleLoading}
          className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeletePatientModal(true)}
          className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
      {
        editPatientModal &&
        <Modal.EditPatient
          id={1}
          editPatientModal={editPatientModal}
          setEditPatientModal={setEditPatientModal}
          setIshandleLoading={setIshandleLoading}
        />
      }
      {
        deletePatientModal &&
        <Modal.DeletePatient
          id={1}
          open={deletePatientModal}
          onOpenChange={setDeletePatientModal}
          setIshandleLoading={setIshandleLoading}
        />

      }
    </DropdownMenu>
  )
}

export default TableOption