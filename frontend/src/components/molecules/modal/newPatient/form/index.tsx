import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type NewPatientFormProps = {
  onSubmit: (data: NewPatientData) => void;
};

type NewPatientData = {
  medical_record_number: string;
  first_exam_date: string;
  last_exam_date: string;
  last_case_date: string;
  status: string;
};

const statusOptions = [
  { label: "Ativa", value: "Active Infection" },
  { label: "Reinfecção", value: " Reinfection" },
  { label: "Em tratamento", value: "Under Treatment" },
  { label: "Treatment Complete", value: "Tratamento completo" },
  { label: "Monitoring (Post-Treatment/Cure)", value: "Montirado (Pós-tratamento/Cura)" },
  { label: "Curado", value: "Cured" },
  { label: "Falha no tratamento", value: "Treatment Failure" },
  { label: "Desconhecido", value: "Unknown" },
];

const NewPatientForm = ({ onSubmit }: NewPatientFormProps) => {
  const [formData, setFormData] = useState<NewPatientData>({
    medical_record_number: "",
    first_exam_date: '',
    last_exam_date: '',
    last_case_date: "",
    status: "",
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
        <Label htmlFor="first_exam_date">Data do diagnóstico</Label>
        <Input
          id="first_exam_date"
          name="first_exam_date"
          type="date"
          value={formData.first_exam_date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="last_exam_date">Data do último diagnóstico</Label>
        <Input
          id="last_exam_date"
          name="last_exam_date"
          type="date"
          value={formData.last_exam_date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="last_case_date">Data do último caso</Label>
        <Input
          id="last_case_date"
          name="last_case_date"
          type="date"
          value={formData.last_case_date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status atual</Label>
        <Select onValueChange={(value) => {
          setFormData((prev) => ({ ...prev, status: value }));
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Estatus atual" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
