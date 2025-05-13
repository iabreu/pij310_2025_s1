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
import { Textarea } from "@/components/ui/textarea";
import { caseService, PatientDataProps } from "@/services/api";
import { titerOptions } from "@/utils/syphilisTiterValues ";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientData?: PatientDataProps | null | undefined;
  refetch: Function;
};

type EditExameProps = {
  titer_result: string;
  diagnosis_date: string;
  notes: string;
  treatments?: any[];
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
    titer_result: "",
    diagnosis_date: "",
    notes: "",
    treatments: [],
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

  const handleSelectExam = (value: string) => {
    setSelectExam(value);
    const selectedExam = patientData?.case_histories.find(
      (historie) => historie.id.toString() == value
    );
    if (selectedExam) {
      setFormData({
        titer_result: selectedExam.titer_result,
        diagnosis_date: selectedExam.diagnosis_date,
        notes: selectedExam.notes || "",
        treatments: Array.isArray(selectedExam.treatments)
          ? selectedExam.treatments
          : [],
      });
      setTreatments(
        Array.isArray(selectedExam.treatments) &&
          selectedExam.treatments.length > 0
          ? selectedExam.treatments
          : [{ name: "", date1: "", date2: "", date3: "" }]
      );
      setShowTreatments(
        Array.isArray(selectedExam.treatments) &&
          selectedExam.treatments.length > 0
      );
    }
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
        dataToSend = { ...dataToSend, treatments: filtered };
      } else {
        dataToSend = { ...dataToSend, treatments: [] };
      }
      await caseService.updateCase(Number(selectExam), dataToSend);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar histórico</DialogTitle>
        </DialogHeader>
        {!selectExam ? (
          <div>
            <DialogDescription>
              <Label htmlFor="exam">Selecione o exame:</Label>
            </DialogDescription>
            <Select value={selectExam} onValueChange={handleSelectExam}>
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
              <Label htmlFor="titer_result">Resultado do exame</Label>
              <Select
                value={formData.titer_result}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    titer_result: value,
                  }))
                }
              >
                <SelectTrigger id="titer_result">
                  <SelectValue placeholder="Titulação" />
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
                {showTreatments ? "Ocultar tratamentos" : "Editar tratamentos"}
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
                              handleTreatmentChange(
                                idx,
                                "date1",
                                e.target.value
                              )
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
                              handleTreatmentChange(
                                idx,
                                "date2",
                                e.target.value
                              )
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
                              handleTreatmentChange(
                                idx,
                                "date3",
                                e.target.value
                              )
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
