"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { caseService, SyphilisCaseProps } from "@/services/api";
import { titerOptions } from "@/utils/syphilisTiterValues ";

type ModalProps = {
  id: string;
  open: boolean;
  refetch: Function;
  onOpenChange: (open: boolean) => void;
};

const NewExam = ({ open, onOpenChange, id, refetch }: ModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SyphilisCaseProps>({
    patient_id: id,
    titer_result: "",
    diagnosis_date: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await caseService.createCase(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar caso:", error);
    } finally {
      refetch();
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar dados do paciente</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Preencha os dados do novo exame abaixo.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status-select">Resultado do exame</Label>
            <Select
              value={formData.titer_result}
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
                <SelectValue placeholder="Status atual" />
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
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>

            <DialogClose asChild>
              <Button disabled={isLoading} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewExam;
