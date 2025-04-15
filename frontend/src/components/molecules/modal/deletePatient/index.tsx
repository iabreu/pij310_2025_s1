import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ModalProps = {
  id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setIshandleLoading: (loading: boolean) => void;
};

const DeletePatient = ({ open, onOpenChange, id, setIshandleLoading }: ModalProps) => {
  const handleDelete = async () => {
    try {
      setIshandleLoading(true);
      // sua chamada de deletar aqui (ex: await deletePatient(id))
      console.log(`Deletando paciente ${id}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
    } finally {
      setIshandleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir paciente</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este paciente? Essa ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePatient;
