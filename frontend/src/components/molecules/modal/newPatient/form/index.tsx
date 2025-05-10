import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { NewPatient } from "@/services/api";

type NewPatientFormProps = {
  onSubmit: (data: NewPatient) => void;
};

const NewPatientForm = ({ onSubmit }: NewPatientFormProps) => {
  const [formData, setFormData] = useState<NewPatient>({
    medical_record_number: "",
    diagnosis_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
  );
};

export default NewPatientForm;
