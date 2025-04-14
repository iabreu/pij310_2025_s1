import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import NewPatientForm from "./form";
import { patientService } from "@/services/api";

type ModalProps = {
  newPatientModal: boolean;
  setNewPatientModal: (open: boolean) => void;
};

const NewPatient = ({ newPatientModal: open, setNewPatientModal: onOpenChange }: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <NewPatientForm onSubmit={(data) => {
            // aqui você chama sua API ou service
            console.log("Paciente:", data);
            patientService.createPatient(data)
            onOpenChange(false);
          }} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatient;
