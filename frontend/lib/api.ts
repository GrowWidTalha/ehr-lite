// API client wrapper for EHR Frontend - New Schema (PascalCase/Integer)
import type {
  ApiError,
  ApiResponse,
  ApiListResponse,
  ApiResult,
  Patient,
  PatientListItem,
  CreatePatientInput,
  UpdatePatientInput,
  PatientLabs,
  PatientImaging,
  PatientTreatments,
  PatientPathology,
  PatientLifestyle,
  LookupsResponse,
  PaginatedResponse,
  PatientSearchParams,
} from './db.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Get base URL for static assets (images, etc) - same as API but without /api
export const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

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
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      console.error('API Error:', {
        endpoint,
        status: response.status,
        error: errorMessage,
        data
      });
      return { success: false, error: errorMessage };
    }

    // If response has success field and data, extract data
    if ('success' in data && 'data' in data) {
      if (!data.success) {
        console.error('API Error: Response indicates failure', {
          endpoint,
          error: data.error,
          data
        });
        return { success: false, error: data.error || 'Request failed' };
      }
      return data;
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('API Network Error:', {
      endpoint,
      error: errorMessage
    });
    return {
      success: false,
      error: errorMessage,
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
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Upload failed with status ${response.status}`;
      console.error('Upload API Error:', {
        endpoint,
        status: response.status,
        error: errorMessage,
        data
      });
      return { success: false, error: errorMessage };
    }

    // If response has success field and data, extract data
    if ('success' in data && 'data' in data) {
      if (!data.success) {
        console.error('Upload API Error: Response indicates failure', {
          endpoint,
          error: data.error,
          data
        });
        return { success: false, error: data.error || 'Upload failed' };
      }
      return data;
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('Upload Network Error:', {
      endpoint,
      error: errorMessage
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Patient API
export const patientApi = {
  list: async (params?: PatientSearchParams): Promise<ApiResult<PaginatedResponse<PatientListItem>>> => {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)])
        ).toString()
      : '';
    return api<PaginatedResponse<PatientListItem>>(`/patients${queryParams ? `?${queryParams}` : ''}`);
  },

  get: (id: number) => api<Patient>(`/patients/${id}`),

  create: (data: CreatePatientInput) =>
    api<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdatePatientInput) =>
    api<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    api<{ success: boolean }>(`/patients/${id}`, {
      method: 'DELETE',
    }),

  // Sub-resource endpoints
  getLabs: (id: number) => api<PatientLabs>(`/patients/${id}/labs`),

  getImaging: (id: number) => api<PatientImaging>(`/patients/${id}/imaging`),

  getTreatments: (id: number) => api<PatientTreatments>(`/patients/${id}/treatments`),

  getPathology: (id: number) => api<PatientPathology>(`/patients/${id}/pathology`),

  getLifestyle: (id: number) => api<PatientLifestyle>(`/patients/${id}/lifestyle`),
};

// Lookups API
export const lookupsApi = {
  getAll: () => api<LookupsResponse>('/lookups'),
};

// Reports API (updated with new report types system)
export const reportsApi = {
  list: (patientId: number, type?: string) =>
    api<any[]>(`/patients/${patientId}/reports${type ? `?type=${type}` : ''}`),

  upload: (patientId: number, formData: FormData) =>
    uploadApi<any>(`/patients/${patientId}/reports`, formData),

  delete: (id: number) =>
    api<{ success: boolean }>(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

// Images API (unchanged - uses polymorphic entity_type)
export const imagesApi = {
  getByEntity: (entityType: string, entityId: number) => {
    const params = new URLSearchParams({ entity_type: entityType, entity_id: String(entityId) });
    return api<any[]>(`/images?${params}`);
  },

  upload: async (entityType: string, entityId: number, file: File, caption?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', String(entityId));
    if (caption) formData.append('caption', caption);

    return uploadApi<any>('/images', formData);
  },

  delete: (id: number) =>
    api<{ success: boolean }>(`/images/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api<{
    totalPatients: number;
    todayRegistrations: number;
    followUpPatients: number;
    cancerTypeBreakdown: Record<string, number>;
  }>('/dashboard/stats'),

  getRecent: () => api<PatientListItem[]>('/dashboard/recent'),
};

// Export API
export const exportApi = {
  /**
   * Export all patients to Excel file
   * Returns a blob that triggers a download
   */
  patients: async (): Promise<{ success: boolean; error?: string; filename?: string }> => {
    try {
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
      totalPatients: number;
      todayRegistrations: number;
      format: string;
      columns: number;
      description: string;
    }>('/export/status'),
};

// Import API
export const importApi = {
  upload: async (file: File): Promise<ApiResult<any>> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/import/upload`, {
        method: 'POST',
        body: formData,
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
  },

  status: () => api<{
    totalPatients: number;
    recentImports: number;
    lastImport: any;
  }>('/import/status'),

  logs: () => api<any[]>('/import/logs'),
};

// Health Check API
export const healthApi = {
  check: () => api<{
    status: string;
    timestamp: string;
    database: any;
  }>('/health'),
};

export { api, uploadApi };
