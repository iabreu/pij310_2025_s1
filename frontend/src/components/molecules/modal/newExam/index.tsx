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
import { Textarea } from "@/components/ui/textarea";
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
    notes: "",
  });
  const [showTreatments, setShowTreatments] = useState(false);
  const [treatments, setTreatments] = useState([
    { name: "", date1: "", date2: "", date3: "" },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTreatmentChange = (idx: number, field: string, value: string) => {
    setTreatments((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  };

  const addTreatment = () => {
    setTreatments((prev) => [
      ...prev,
      { name: "", date1: "", date2: "", date3: "" },
    ]);
  };

  const removeTreatment = (idx: number) => {
    setTreatments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let dataToSend = { ...formData };
      if (showTreatments) {
        const filtered = treatments.filter((t) => t.name && t.date1);
        if (filtered.length > 0) {
          dataToSend = { ...dataToSend, treatments: filtered };
        }
      }
      await caseService.createCase(dataToSend);
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
      <DialogContent className="max-w-2xl">
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
            <Label htmlFor="notes">Informações adicionais (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Digite aqui informações adicionais sobre o exame..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <button
              type="button"
              className="text-blue-600 underline text-sm mb-2"
              onClick={() => setShowTreatments((v) => !v)}
            >
              {showTreatments ? "Ocultar tratamentos" : "Adicionar tratamentos"}
            </button>
            {showTreatments && (
              <div className="space-y-4 border rounded p-2">
                {treatments.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 border-b pb-2 mb-2"
                  >
                    <div className="flex gap-2 items-center">
                      <Label>Nome do tratamento</Label>
                      <Input
                        value={t.name}
                        onChange={(e) =>
                          handleTreatmentChange(idx, "name", e.target.value)
                        }
                        required={false}
                        placeholder="Nome"
                      />
                      <button
                        type="button"
                        className="text-red-500 ml-2"
                        onClick={() => removeTreatment(idx)}
                        disabled={treatments.length === 1}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <Label>Data 1*</Label>
                        <Input
                          type="date"
                          value={t.date1}
                          onChange={(e) =>
                            handleTreatmentChange(idx, "date1", e.target.value)
                          }
                          required={false}
                        />
                      </div>
                      <div>
                        <Label>Data 2</Label>
                        <Input
                          type="date"
                          value={t.date2}
                          onChange={(e) =>
                            handleTreatmentChange(idx, "date2", e.target.value)
                          }
                          required={false}
                        />
                      </div>
                      <div>
                        <Label>Data 3</Label>
                        <Input
                          type="date"
                          value={t.date3}
                          onChange={(e) =>
                            handleTreatmentChange(idx, "date3", e.target.value)
                          }
                          required={false}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-green-600 underline text-sm"
                  onClick={addTreatment}
                >
                  Adicionar mais tratamento
                </button>
              </div>
            )}
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
