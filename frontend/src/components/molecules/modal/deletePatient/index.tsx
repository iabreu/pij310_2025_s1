import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { patientService } from "@/services/api";
import { useState } from "react";

type ModalProps = {
  id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setIshandleLoading: (loading: boolean) => void;
  refetch: Function;
};

const DeletePatient = ({
  id,
  open,
  refetch,
  onOpenChange,
  setIshandleLoading,
}: ModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    try {
      setIshandleLoading(true);
      setIsLoading(true);
      await patientService.deletePatient(id);
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
    } finally {
      setIshandleLoading(false);
      onOpenChange(false);
      refetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir paciente</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este paciente? Essa ação não poderá
            ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button disabled={isLoading} variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            disabled={isLoading}
            variant="destructive"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePatient;
