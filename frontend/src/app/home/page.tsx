"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";

export default function HomePage() {
  const { user, loading: isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      {/* Card sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1 */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-neutral-800 relative flex flex-col">
          <h3 className="text-xl font-bold mb-2">Acompanhe os testes</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
            Veja os resultados dos testes dos pacientes
          </p>
          <div className="mt-auto self-end">
            <Button
              variant="link"
              className="text-purple-600 dark:text-purple-400 p-0 flex items-center"
            >
              VER <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-neutral-800 relative flex flex-col">
          <h3 className="text-xl font-bold mb-2">Acompanhe os casos</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
            Faça o acompanhamento e gestão dos casos em andamento
          </p>
          <div className="mt-auto self-end">
            <Button
              variant="link"
              className="text-purple-600 dark:text-purple-400 p-0 flex items-center"
            >
              VER <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-neutral-800 relative flex flex-col">
          <h3 className="text-xl font-bold mb-2">Tratamentos</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
            Veja os dados sobre tratamentos os em andamento, faça anotações,
            edite e etc.
          </p>
          <div className="mt-auto self-end">
            <Button
              variant="link"
              className="text-purple-600 dark:text-purple-400 p-0 flex items-center"
            >
              VER <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-neutral-800 relative flex flex-col">
          <h3 className="text-xl font-bold mb-2">Pacientes</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
            Acompanhe os dados de seus pacientes, faça anotações e etc.
          </p>
          <div className="mt-auto self-end">
            <Button
              variant="link"
              className="text-purple-600 dark:text-purple-400 p-0 flex items-center"
              onClick={() => router.push("/patients")}
            >
              VER <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Recent Activities Section */}
      <section className="mb-10">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Atividades Recentes</h2>
            <Button variant="outline" size="sm" className="text-sm">
              Ver Todas
            </Button>
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                      Paciente
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Activity 1 */}
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium mr-3">
                          JS
                        </div>
                        <span>João Silva</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      Hoje, 14:30
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Tratamento Concluído
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>

                  {/* Activity 2 */}
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3">
                          MA
                        </div>
                        <span>Maria Almeida</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      Ontem, 09:15
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Em Tratamento
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>

                  {/* Activity 3 */}
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-medium mr-3">
                          CP
                        </div>
                        <span>Carlos Pereira</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      22/04/2024
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Novo Caso
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
    </PageLayout>
  );
}
