import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { patientService } from "@/services/api";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

type ModalProps = {
  editPatientModal: boolean;
  setEditPatientModal: (open: boolean) => void;
  id: number
  setIshandleLoading: (loading: boolean) => void
};

type PatientData = {
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  taxpayer_number: string;
  diagnosis_date: string;
};

const NewPatient = ({
  setIshandleLoading,
  editPatientModal: open,
  setEditPatientModal:
  onOpenChange,
  id }: ModalProps) => {
  const [formData, setFormData] = useState<PatientData>({
    medical_record_number: "",
    name: "",
    date_of_birth: "",
    taxpayer_number: "",
    diagnosis_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIshandleLoading(true)
    patientService.updatePatient(id, formData)
    onOpenChange(false);
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="medical_record_number">Prontuário</Label>
              <Input
                id="medical_record_number"
                name="medical_record_number"
                value={formData.medical_record_number}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">Data de nascimento</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="taxpayer_number">CPF</Label>
              <Input
                id="taxpayer_number"
                name="taxpayer_number"
                value={formData.taxpayer_number}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="diagnosis_date">Data do diagnóstico</Label>
              <Input
                id="diagnosis_date"
                name="diagnosis_date"
                type="date"
                value={formData.diagnosis_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-row-reverse w-full gap-2 ">
              <Button type="submit">Salvar</Button>

              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatient;
