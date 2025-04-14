import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type NewPatientFormProps = {
  onSubmit: (data: NewPatientData) => void;
};

type NewPatientData = {
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  taxpayer_number: string;
  diagnosis_date: string;
};

const NewPatientForm = ({ onSubmit }: NewPatientFormProps) => {
  const [formData, setFormData] = useState<NewPatientData>({
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

      <Button type="submit">Salvar</Button>
    </form>
  );
};

export default NewPatientForm;
