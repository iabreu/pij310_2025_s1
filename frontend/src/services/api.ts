// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || "";

// Types based on backend schemas
export type CaseHistoriesProps = {
  patient_id: string;
  diagnosis_date: string;
  titer_result: string;
  status: string;
  treatments: string | null;
  notes: string;
  id: string;
  created_at: string;
  updated_at: string;
};

export type PatientDataProps = {
  medical_record_number: string;
  diagnosis_date: string;
  status: string;
  id: string;
  case_histories: CaseHistoriesProps[];
};

export type Patient = {
  id?: number;
  medical_record_number: string;
  first_exam_date: string;
  last_exam_date?: string;
  last_case_date?: string;
  status: string;
};

export type NewPatient = {
  medical_record_number: string;
  diagnosis_date: string;
};

export type SyphilisCase = {
  id: number;
  patient_id: number;
  diagnosis_date: string;
  stage: string;
  initial_title: string | null;
  treatment_status: string;
  notes: string | null;
};

export type Treatment = {
  id: number;
  syphilis_case_id: number;
  medication: string;
  dosage: string;
  notes: string | null;
  created_at: string;
};

export type FollowUpTest = {
  id: number;
  patient_id: number;
  syphilis_case_id: number;
  test_date: string;
  test_type: string;
  result: string;
  title: string | null;
  notes: string | null;
};

export type NewPatientData = {
  medical_record_number: string;
  first_exam_date: string;
  last_exam_date: string;
  last_case_date: string;
  status: string;
};

export type SyphilisCaseProps = {
  patient_id: string;
  titer_result: string;
  diagnosis_date: string;
  status: string;
};

// API service for patients
export const patientService = {
  // Get all patients
  getPatients: async (): Promise<Patient[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/`);

      // If 404, return empty array (no patients found)
      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      throw error;
    }
  },

  // Get patient by ID
  getPatient: async (id: number): Promise<PatientDataProps> => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch patient ${id}:`, error);
      throw error;
    }
  },

  // Create a new patient
  createPatient: async (patientData: NewPatient): Promise<PatientDataProps> => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to create patient:", error);
      throw error;
    }
  },

  // Update a patient
  updatePatient: async (
    id: number,
    patientData: Omit<Patient, "id">
  ): Promise<Patient> => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update patient ${id}:`, error);
      throw error;
    }
  },

  deletePatient: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro ao deletar paciente: ${response.status} ${response.statusText}`
        );
      }

      // Algumas APIs retornam um body vazio no DELETE, então é bom verificar:
      const data = await response.json().catch(() => null);
      return data;
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      throw error;
    }
  },
};

// API service for syphilis cases
export const caseService = {
  // Get all cases
  getCases: async (patientId?: number): Promise<SyphilisCase[]> => {
    try {
      const url = patientId
        ? `${API_BASE_URL}/cases?patient_id=${patientId}`
        : `${API_BASE_URL}/cases`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch cases:", error);
      throw error;
    }
  },

  // Get case by ID
  getCase: async (id: number): Promise<SyphilisCase> => {
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch case ${id}:`, error);
      throw error;
    }
  },

  // Create a new case
  createCase: async (caseData: SyphilisCaseProps): Promise<SyphilisCase> => {
    try {
      const response = await fetch(`${API_BASE_URL}/syphilis-case-history/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(caseData),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to create case:", error);
      throw error;
    }
  },

  // Update a case
  updateCase: async (
    id: number,
    caseData: { notes: string; titer_result: string }
  ): Promise<SyphilisCase> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/syphilis-case-history/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(caseData),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update case ${id}:`, error);
      throw error;
    }
  },
};
