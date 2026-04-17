// API client wrapper for EHR Frontend
import type {
  ApiError,
  ApiResponse,
  ApiListResponse,
  ApiResult,
  Patient,
  PatientListItem,
  CreatePatientInput,
  UpdatePatientInput,
  PatientVitals,
  CreateVitalsInput,
  PatientHistory,
  CreateHistoryInput,
  PatientHabits,
  CreateHabitsInput,
  CancerDiagnosis,
  CreateDiagnosisInput,
  Report,
  CreateReportInput,
  PatientSearchParams,
} from './db.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Generic API fetch wrapper
async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// FormData upload wrapper (for images)
async function uploadApi<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type for FormData - browser does it automatically with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Upload failed' };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Patient API
export const patientApi = {
  list: (params?: PatientSearchParams) => {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)])
        ).toString()
      : '';
    return api<PatientListItem[]>(`/patients${queryParams ? `?${queryParams}` : ''}`);
  },

  get: (id: string) => api<Patient>(`/patients/${id}`),

  create: (data: CreatePatientInput) =>
    api<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePatientInput) =>
    api<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    api<{ success: boolean }>(`/patients/${id}`, {
      method: 'DELETE',
    }),
};

// Vitals API
export const vitalsApi = {
  list: (patientId: string) =>
    api<PatientVitals[]>(`/patients/${patientId}/vitals`),

  create: (patientId: string, data: CreateVitalsInput) =>
    api<PatientVitals>(`/patients/${patientId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// History API
export const historyApi = {
  get: (patientId: string) =>
    api<PatientHistory>(`/patients/${patientId}/history`),

  update: (patientId: string, data: CreateHistoryInput) =>
    api<PatientHistory>(`/patients/${patientId}/history`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Habits API
export const habitsApi = {
  get: (patientId: string) =>
    api<PatientHabits>(`/patients/${patientId}/habits`),

  update: (patientId: string, data: CreateHabitsInput) =>
    api<PatientHabits>(`/patients/${patientId}/habits`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Diagnosis API
export const diagnosisApi = {
  list: (patientId: string) =>
    api<CancerDiagnosis[]>(`/patients/${patientId}/diagnoses`),

  get: (patientId: string, id: string) =>
    api<CancerDiagnosis>(`/patients/${patientId}/diagnoses/${id}`),

  create: (patientId: string, data: CreateDiagnosisInput) =>
    api<CancerDiagnosis>(`/patients/${patientId}/diagnoses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (patientId: string, id: string, data: Partial<CreateDiagnosisInput>) =>
    api<CancerDiagnosis>(`/patients/${patientId}/diagnoses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (patientId: string, id: string) =>
    api<{ success: boolean }>(`/patients/${patientId}/diagnoses/${id}`, {
      method: 'DELETE',
    }),
};

// Reports API
export const reportsApi = {
  list: (patientId: string, type?: string) =>
    api<Report[]>(`/patients/${patientId}/reports${type ? `?type=${type}` : ''}`),

  upload: (patientId: string, formData: FormData) =>
    uploadApi<Report>(`/patients/${patientId}/reports`, formData),

  delete: (id: string) =>
    api<{ success: boolean }>(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

// Search API
export const searchApi = {
  patients: (query: string, type?: string) =>
    api<PatientListItem[]>(
      `/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}`
    ),
};

// Export API
export const exportApi = {
  /**
   * Export all patients to Excel file
   * Returns a blob that triggers a download
   */
  patients: async (): Promise<{ success: boolean; error?: string; filename?: string }> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE_URL}/export/patients`);

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || 'Export failed' };
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `ehr-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      // Get blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  /**
   * Get export status and recent export info
   */
  status: () =>
    api<{
      today: { exportCount: number; totalPatients: number; lastExport: any };
      format: string;
      columns: number;
      description: string;
    }>('/export/status'),
};

export { api, uploadApi };
