"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Card, Spinner, Table } from "@/components";

import { patientService } from '@/services/api'

import { Patient } from "@/services/api";

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const { user, loading: isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    setLoading(true)
    patientService.getPatients()
      .then(data => setPatients(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <PageLayout>
      {/* Card sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title='Acompanhe os testes'
          description="Veja os resultados dos testes dos pacientes"
          onClick={() => console.log('acompanhe')}
        />
        <Card
          title="Acompanhe os casos"
          description="Faça o acompanhamento e gestão dos casos em andamento"
          onClick={() => console.log('acompanhe')}
        />
        <Card
          title="Tratamentos"
          description="Veja os dados sobre tratamentos os em andamento, faça anotações, edite e etc."
          onClick={() => console.log('acompanhe')}
        />
        <Card
          title='Pacientes'
          description="Acompanhe os dados de seus pacientes, faça anotações e etc."
          onClick={() => console.log('acompanhe')}
        />
      </section>

      {/* Recent Activities Section */}
      <section className="mb-10">
        {loading ?
          <Spinner />
          :
          <Table
            title="Atividades recentes"
            columns={['Paciente', 'Data', 'Status', 'Ação']}
            rows={patients}
          />}
      </section>

      {/* Graph section */}
      <section className="mb-10">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Estatísticas do Ano</h2>
          <div className="h-80 w-full flex flex-col justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            {/* Placeholder for the graph */}
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-500">
                Aqui será exibido o gráfico de estatísticas
              </p>
            </div>

            {/* Legend */}
            <div className="flex justify-center items-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                <span className="text-sm">Novos casos</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                <span className="text-sm">Reinfecções</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-sm mr-2"></div>
                <span className="text-sm">Curados</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout >
  );
}
