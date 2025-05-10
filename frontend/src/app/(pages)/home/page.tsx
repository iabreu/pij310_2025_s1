"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Card, Spinner, Table } from "@/components";

import { patientService } from "@/services/api";

import { Patient } from "@/services/api";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoadingtable, setIsLoadingtable] = useState(false);

  const { user, loading: isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const getPatients = async () => {
    setIsLoadingtable(true);
    setIsError(false);
    patientService
      .getPatients()
      .then((data) => {
        setPatients(data);
      })
      .catch((err) => {
        setIsError(true);
        console.error(err);
      })
      .finally(() => setIsLoadingtable(false));
  };

  useEffect(() => {
    getPatients();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <PageLayout>
      <section className="my-auto w-full">
        {isLoadingtable ? (
          isError ? (
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => getPatients()}
            >
              Recarregar
            </Button>
          ) : (
            <Spinner />
          )
        ) : (
          <Table
            title="Atividades recentes"
            columns={[
              "Paciente",
              "Prontuario",
              "Data do Diagnóstico",
              "Status",
              "Ação",
            ]}
            rows={patients}
            getPatients={getPatients}
          />
        )}
      </section>
    </PageLayout>
  );
};

export default HomePage;
