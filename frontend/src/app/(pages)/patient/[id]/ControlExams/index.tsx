import { PatientDataProps } from "@/services/api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Info } from "lucide-react";

type ExameControlProps = {
  patientData?: PatientDataProps | null | undefined;
};

const ExameControl = ({ patientData }: ExameControlProps) => {
  const length = patientData?.case_histories?.length ?? 0;
  const [expandedNotes, setExpandedNotes] = useState<{
    [key: number]: boolean;
  }>({});
  const [treatmentsModal, setTreatmentsModal] = useState<{
    open: boolean;
    treatments: any[] | null;
  }>({ open: false, treatments: null });
  const [infoModal, setInfoModal] = useState<{ open: boolean; notes: string }>({
    open: false,
    notes: "",
  });

  const openTreatmentsModal = (treatments: any[]) => {
    setTreatmentsModal({ open: true, treatments });
  };

  const closeTreatmentsModal = () => {
    setTreatmentsModal({ open: false, treatments: null });
  };

  const openInfoModal = (notes: string) => {
    setInfoModal({ open: true, notes });
  };

  const closeInfoModal = () => {
    setInfoModal({ open: false, notes: "" });
  };

  return (
    <div className="w-full flex flex-col h-full">
      <h1 className="font-bold text-lg p-2 bg-white dark:bg-neutral-800">
        Histórico
      </h1>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-center border-collapse bg-white dark:bg-neutral-900">
          <thead className="bg-zinc-700 text-white sticky top-0 z-10">
            <tr>
              <th className="p-1 md:p-4 w-[15%]">Data</th>
              <th className="p-1 md:p-4 w-[15%]">Titulação</th>
              <th className="p-1 md:p-4 w-[15%]">Status</th>
              <th className="p-1 md:p-4 w-[25%]">Tratamentos</th>
              <th className="p-1 md:p-4 w-[30%] text-center">
                Informações adicionais
              </th>
            </tr>
          </thead>
          <tbody>
            {length > 0 ? (
              patientData?.case_histories.map((historie, index: number) => {
                const colors = ["bg-neutral-700/10", "bg-neutral-700/30"];
                const rowColor = colors[index % colors.length];
                const treatments = historie.treatments;
                let treatmentsDisplay = null;
                if (Array.isArray(treatments) && treatments.length > 0) {
                  treatmentsDisplay = (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1 mx-auto"
                      onClick={() => openTreatmentsModal(treatments)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver tratamentos
                    </Button>
                  );
                } else {
                  treatmentsDisplay = "-";
                }

                let infoDisplay: React.ReactNode = "-";
                if (historie.notes && historie.notes.length > 0) {
                  infoDisplay = (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => openInfoModal(historie.notes)}
                    >
                      <Info className="w-4 h-4" />
                      Ver informações
                    </Button>
                  );
                }

                return (
                  <tr key={index} className={`border-gray-100 ${rowColor}`}>
                    <td className="p-1 md:p-4 w-[15%]">
                      {historie.diagnosis_date}
                    </td>
                    <td className="p-1 md:p-4 w-[15%]">
                      {historie.titer_result}
                    </td>
                    <td className="p-1 md:p-4 w-[15%]">{historie.status}</td>
                    <td className="p-1 md:p-4 w-[25%]">{treatmentsDisplay}</td>
                    <td className="p-1 md:p-4 w-[30%] text-center">
                      <div className="flex justify-center">{infoDisplay}</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className={`border-gray-100`}>
                <td className="p-1 md:p-4 w-[15%]"></td>
                <td className="p-1 md:p-4 w-[15%]">Sem dados</td>
                <td className="p-1 md:p-4 w-[15%]"></td>
                <td className="p-1 md:p-4 w-[25%]"></td>
                <td className="p-1 md:p-4 w-[30%]"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Treatments Modal */}
      <Dialog open={treatmentsModal.open} onOpenChange={closeTreatmentsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tratamentos</DialogTitle>
          </DialogHeader>
          {Array.isArray(treatmentsModal.treatments) &&
          treatmentsModal.treatments.length > 0 ? (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr>
                  <th className="border-b p-2">Nome</th>
                  <th className="border-b p-2">Data 1</th>
                  <th className="border-b p-2">Data 2</th>
                  <th className="border-b p-2">Data 3</th>
                </tr>
              </thead>
              <tbody>
                {treatmentsModal.treatments.map((t, i) => (
                  <tr key={i}>
                    <td className="p-2">{t.name}</td>
                    <td className="p-2">{t.date1}</td>
                    <td className="p-2">{t.date2}</td>
                    <td className="p-2">{t.date3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>Nenhum tratamento cadastrado.</div>
          )}
          <DialogClose asChild>
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Fechar
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={infoModal.open} onOpenChange={closeInfoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Informações adicionais</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-line break-words p-2 text-base bg-gray-50 rounded max-w-full max-h-[60vh] overflow-y-auto">
            {infoModal.notes}
          </div>
          <DialogClose asChild>
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Fechar
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExameControl;
