"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientDataProps, patientService } from "@/services/api";
import { Modal, Spinner } from "@/components";
import PageLayout from "@/components/PageLayout";
import { number } from "zod";
import { statusColor } from "@/utils/functions";
import { Button } from "@/components/ui/button";
import ExameControl from "./ControlExams";
import { Edit, PlusSquare } from "lucide-react";

const PatientPage = () => {
  const [patientData, setPatientData] = useState<PatientDataProps | null>(null);
  const [handleOpenNewExam, setHandleOpenNewExam] = useState<boolean>(false);
  const [isPatientLoading, setIsPatientiLoading] = useState<boolean>(false);
  const [handleOpenEdit, setHandleOpenEdit] = useState<boolean>(false);
  const params = useParams();
  const route = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) {
      setIsPatientiLoading(true);
      try {
        patientService
          .getPatient(Number(id))
          .then((res) => setPatientData(res));
      } catch (err) {
        console.error(err);
      } finally {
        setIsPatientiLoading(false);
      }
    }
  }, [id]);

  const handleBackHome = () => {
    route.push("/home");
  };

  const refetch = () => {
    setIsPatientiLoading(true);

    try {
      patientService.getPatient(Number(id)).then((res) => setPatientData(res));
    } catch (err) {
      console.error(err);
    } finally {
      setIsPatientiLoading(false);
    }
  };

  if (isPatientLoading) {
    return <Spinner />;
  }

  if (!patientData && !isPatientLoading) {
    return (
      <PageLayout>
        <section className="flex justify-center items-center m-auto w-full h-full">
          <button onClick={refetch}>Recarregar</button>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="w-full h-full">
        <Button variant={"ghost"} onClick={handleBackHome}>
          voltar
        </Button>
        <div className="flex md:flex-row flex-col w-full h-ull py-4 text-right justify-center md:justify-end gap-4">
          <Button
            onClick={() => setHandleOpenNewExam(true)}
            className="w-full md:w-auto"
          >
            <PlusSquare width={16} className="mr-2" />
            Adicionar exame
          </Button>
          <Button
            onClick={() => setHandleOpenEdit(true)}
            className="w-full md:w-auto"
          >
            <Edit width={16} className="mr-2" /> Editar
          </Button>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full h-auto">
          <div className="w-full flex flex-col">
            <h1 className="font-bold text-lg p-2">Acompanhamento individual</h1>
            <table className="w-fit flex text-left bg-zinc-700 rounded-md p-2">
              <tbody>
                <tr className="border-b-2">
                  <th className="w-[200px] text-left p-2">Proturario</th>
                  <td>{patientData?.medical_record_number}</td>
                </tr>
                <tr className="border-b-2">
                  <th className="w-[200px] text-left p-2">
                    Data exame Inicial
                  </th>
                  <td>{patientData?.diagnosis_date}</td>
                </tr>
                <tr>
                  <th className="w-[200px] text-left p-2">Titulação Inicial</th>
                  <td>{patientData?.case_histories[0].titer_result}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full flex items-center gap-4 p-2">
            <h1 className="font-bold text-lg">Estatus atual: </h1>
            <span
              className={`${statusColor(
                patientData?.status || "Unknown"
              )} text-center w-fit h-fit px-2.5 py-0.5 rounded-full`}
            >
              {patientData?.status}
            </span>
          </div>
          <div className="w-full flex flex-col justify-center">
            <h1 className="font-bold text-lg p-2">Tratamento</h1>
            <table>
              <tbody>
                <tr>
                  {patientData?.case_histories.map((historie, key: number) => (
                    <td key={key} className="p-2">
                      {historie.diagnosis_date}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <ExameControl patientData={patientData} />
        </section>
      </section>
      {handleOpenNewExam && (
        <Modal.NewExam
          onOpenChange={setHandleOpenNewExam}
          open={handleOpenNewExam}
          // @ts-ignore
          id={id}
        />
      )}
      {handleOpenEdit && (
        <Modal.EditPatientData
          onOpenChange={setHandleOpenEdit}
          open={handleOpenEdit}
        />
      )}
    </PageLayout>
  );
};
export default PatientPage;
