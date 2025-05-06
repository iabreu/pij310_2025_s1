'use client'
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusOptions } from "@/utils/statusList";
import { NewPatientData } from "@/services/api";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EditPatientData = ({ open, onOpenChange }: ModalProps) => {
  const [formData, setFormData] = useState<NewPatientData>({
    medical_record_number: "",
    first_exam_date: "",
    last_exam_date: "",
    last_case_date: "",
    status: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
    // Aqui você pode fazer o POST ou PUT com os dados
    onOpenChange(false); // fecha o modal
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar dados do paciente</DialogTitle>
          <DialogDescription>
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
                <Label htmlFor="status-select">Status atual</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger id="status-select">
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
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientData;
