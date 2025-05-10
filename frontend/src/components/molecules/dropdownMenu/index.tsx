import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "../modal";
import { useRouter } from "next/navigation";

type ModalProps = {
  id: number;
  refetch: Function;
};

const TableOption = ({ id, refetch }: ModalProps) => {
  const [isHandleLoading, setIshandleLoading] = useState<boolean>(false);
  const [deletePatientModal, setDeletePatientModal] = useState<boolean>(false);

  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/patient/${id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="flex flex-col bg-zinc-700 rounded-md overflow-hidden shadow-md text-sm w-40"
      >
        <DropdownMenuItem
          onClick={handleEditClick}
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
      {deletePatientModal && (
        <Modal.DeletePatient
          id={id}
          open={deletePatientModal}
          onOpenChange={setDeletePatientModal}
          setIshandleLoading={setIshandleLoading}
          refetch={refetch}
        />
      )}
    </DropdownMenu>
  );
};

export default TableOption;
