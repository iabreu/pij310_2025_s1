"use client";
import { ReactElement, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusOptions } from "@/utils/statusList";
import {
  CaseHistoriesProps,
  caseService,
  PatientDataProps,
} from "@/services/api";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientData?: PatientDataProps | null | undefined;
};

const EditPatientData = ({ open, onOpenChange, patientData }: ModalProps) => {
  const [selectExam, setSelectExam] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CaseHistoriesProps>({
    created_at: "",
    diagnosis_date: "",
    id: "",
    notes: "",
    patient_id: "",
    titer_result: "",
    treatments: "",
    updated_at: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectExam = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedExamId = parseInt(e.target.value);
    setSelectExam(selectedExamId.toString());

    const selectedExam = patientData?.case_histories.find(
      (historie) => historie.id.toString() === selectedExamId.toString()
    );

    if (selectedExam) {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };

      setFormData({
        id: selectedExam.id,
        notes: selectedExam.notes,
        status: selectedExam.status,
        patient_id: selectedExam.patient_id,
        created_at: selectedExam.created_at,
        treatments: selectedExam.treatments,
        titer_result: selectedExam.titer_result,
        diagnosis_date: selectedExam.diagnosis_date,
        updated_at: now.toLocaleDateString("pt-BR", options),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await caseService.updateCase(Number(formData.id), formData);
    } catch (err) {
      console.error(err);
    } finally {
      onOpenChange(false);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar dados do paciente</DialogTitle>
        </DialogHeader>
        {!selectExam ? (
          <div>
            <DialogDescription>Selecione o exame:</DialogDescription>

            <select
              name="exam"
              id="exam"
              className="my-2 p-2 rounded-md text-white"
              onChange={handleSelectExam}
              value={selectExam || ""}
            >
              <option disabled value="" selected>
                Selecionar exame
              </option>

              {patientData?.case_histories
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map((historie, index: number) => (
                  <option
                    key={index}
                    value={historie.id}
                    className="hover:cursor-pointer"
                  >
                    Exame {historie.diagnosis_date}
                  </option>
                ))}
            </select>
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="titer_result">Resultado do Título</Label>
              <Input
                id="titer_result"
                name="titer_result"
                value={formData.titer_result}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="treatments">Tratamentos</Label>
              <Input
                id="treatments"
                name="treatments"
                value={formData.treatments || ""}
                onChange={handleChange}
                required
                disabled={isLoading}
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
                disabled={isLoading}
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
              <Button disabled={isLoading} type="submit">
                Salvar
              </Button>

              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientData;
