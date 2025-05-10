"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { caseService, PatientDataProps } from "@/services/api";
import { titerOptions } from "@/utils/syphilisTiterValues ";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientData?: PatientDataProps | null | undefined;
  refetch: Function;
};

type EditExameProps = {
  notes: string;
  titer_result: string;
};

const EditPatientData = ({
  open,
  onOpenChange,
  patientData,
  refetch,
}: ModalProps) => {
  const [selectExam, setSelectExam] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<EditExameProps>({
    notes: "",
    titer_result: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectExam = (value: string) => {
    setSelectExam(value);

    const selectedExam = patientData?.case_histories.find(
      (historie) => historie.id.toString() == value
    );

    if (selectedExam) {
      setFormData({
        notes: selectedExam.notes,
        titer_result: selectedExam.titer_result,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await caseService.updateCase(Number(selectExam), formData);
    } catch (err) {
      console.error(err);
    } finally {
      onOpenChange(false);
      setIsLoading(false);
      refetch();
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
            <DialogDescription>
              <Label htmlFor="exam">Selecione o exame:</Label>
            </DialogDescription>

            <Select
              value={selectExam}
              defaultValue={formData.titer_result}
              onValueChange={handleSelectExam}
            >
              <SelectTrigger id="exam">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {patientData?.case_histories.map((option, index) => (
                  <SelectItem key={index} value={option.id}>
                    {option.diagnosis_date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                value={formData.notes || ""}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="status-select">Resultado do exame</Label>
              <Select
                value={formData.titer_result}
                defaultValue={formData.titer_result}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    titer_result: value,
                  }))
                }
              >
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Status atual" />
                </SelectTrigger>
                <SelectContent>
                  {titerOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
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
