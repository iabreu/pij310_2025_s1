import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
            patientService.createPatient(data)
            onOpenChange(false);
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatient;
