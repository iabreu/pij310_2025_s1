"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Search, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Patient, patientService } from "@/services/api";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageLayout from "@/components/PageLayout";

// Mock infection type data (this would come from the backend in a real scenario)
type InfectionType = "Primeira infecção" | "Reinfecção";

// Mock status for each patient (would come from backend)
type PatientStatus = "Ativa" | "Inativa";

export default function PatientsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Function to format date in DD/MM/YYYY
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Function to get patient status (mock for now)
  const getPatientStatus = (patient: Patient): PatientStatus => {
    // This would be based on actual data from API in a real scenario
    return patient.id % 3 === 0 ? "Inativa" : "Ativa";
  };

  // Function to get infection type (mock for now)
  const getInfectionType = (patient: Patient): InfectionType => {
    // This would be based on actual data from API in a real scenario
    return patient.id % 2 === 0 ? "Reinfecção" : "Primeira infecção";
  };

  // Fetch patients data from the API
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch patients:", err);
      // Check if it's a 404 error (Not Found)
      if (err.message && err.message.includes("404")) {
        // Set patients to empty array (no patients found)
        setPatients([]);
        setError(null);
      } else {
        setError("Falha ao carregar pacientes. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // Load data and retry once if it fails
    const loadData = async () => {
      try {
        await fetchPatients();
      } catch (err) {
        // If failed on first attempt, try one more time after a delay
        setTimeout(async () => {
          try {
            await fetchPatients();
          } catch (retryErr) {
            // If it fails again, we already show the error message
            console.error("Retry failed:", retryErr);
          }
        }, 2000); // 2 second delay before retry
      }
    };

    loadData();
  }, [user, authLoading, router]);

  // Filter patients based on search term
  useEffect(() => {
    if (!patients.length) {
      setFilteredPatients([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(lowercasedSearch) ||
        patient.medical_record_number.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Handle patient deletion
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    // In a real implementation, we would call the API to delete the patient
    // For now, we'll just simulate the deletion by removing from our local state
    setPatients(patients.filter((p) => p.id !== selectedPatient.id));
    setFilteredPatients(
      filteredPatients.filter((p) => p.id !== selectedPatient.id)
    );
    setDeleteDialogOpen(false);
    setSelectedPatient(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Lista de pacientes"
      subtitle="Gerencia os dados dos pacientes"
    >
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-end mb-6">
          <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            <span>Novo paciente</span>
          </Button>
        </div>

        {error ? (
          <div className="text-red-500 dark:text-red-400 p-8 text-center flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium mb-4">{error}</p>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={fetchPatients}
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Tentar novamente</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar paciente por nome ou registro médico..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-neutral-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Paciente
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Data de nascimento
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Primeiro diagnóstico
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Último diagnóstico
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Última consulta
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Status da doença
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Tipo da infecção
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 text-gray-400 mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <span className="text-lg font-medium">
                              {patients.length === 0 && !isLoading
                                ? "Não existe pacientes cadastrados"
                                : "Nenhum resultado encontrado para a pesquisa"}
                            </span>
                            <p className="mt-2 max-w-md text-center">
                              {patients.length === 0 && !isLoading
                                ? "Clique no botão 'Novo paciente' para adicionar seu primeiro paciente."
                                : "Tente usar termos diferentes ou limpe a pesquisa."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient, index) => (
                        <tr
                          key={patient.id}
                          className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700/10"
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium">
                              {patient.name || `Paciente ${index + 1}`}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(patient.date_of_birth)}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(patient.diagnosis_date)}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(patient.diagnosis_date)}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(patient.diagnosis_date)}
                          </td>
                          <td className="py-4 px-4">
                            <div className={`flex items-center`}>
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  getPatientStatus(patient) === "Ativa"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                              <span
                                className={
                                  getPatientStatus(patient) === "Ativa"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }
                              >
                                {getPatientStatus(patient)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {getInfectionType(patient)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem>Finalizar</DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={() => {
                                    setSelectedPatient(patient);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o paciente{" "}
              <span className="font-medium">{selectedPatient?.name}</span>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
