"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientDataProps, patientService } from "@/services/api";

import { Card, Modal, Spinner } from "@/components";

import PageLayout from "@/components/PageLayout";

import { statusColor } from "@/utils/functions";
import { Button } from "@/components/ui/button";

import ExameControl from "./ControlExams";

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
      <section className="w-full h-auto overflow-hidden flex flex-col">
        <div>
          <Button variant={"ghost"} onClick={handleBackHome}>
            Voltar
          </Button>
        </div>
        <section className="flex flex-col gap-5 w-full flex-1 md:overflow-hidden overflow-y-auto">
          <div className="flex justify-center gap-4 flex-wrap">
            <Card
              title="Prontuário"
              description={patientData?.medical_record_number || ""}
            />
            <Card
              title="Data exame"
              description={patientData?.case_histories?.[0]?.created_at || ""}
            />
            <Card
              title="Titulação Atual"
              description={
                patientData?.case_histories?.[0]?.titer_result ||
                "Sem titulação"
              }
            />
            <Card
              title="Status atual"
              description={patientData?.status || "Sem estatus"}
              contentClass={`${statusColor(
                patientData?.status || "Unknown"
              )} text-center w-fit h-fit px-2.5 py-0.5 rounded-full`}
            />
          </div>

          <ExameControl
            patientData={patientData}
            setHandleOpenNewExam={setHandleOpenNewExam}
            setHandleOpenEdit={setHandleOpenEdit}
          />
        </section>
      </section>
      {handleOpenNewExam && (
        <Modal.NewExam
          onOpenChange={setHandleOpenNewExam}
          open={handleOpenNewExam}
          refetch={refetch}
          id={id?.toString() || ""}
        />
      )}
      {handleOpenEdit && (
        <Modal.EditPatientData
          onOpenChange={setHandleOpenEdit}
          open={handleOpenEdit}
          refetch={refetch}
          patientData={patientData}
        />
      )}
    </PageLayout>
  );
};
export default PatientPage;
