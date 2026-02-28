import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
}

// Phone number formatting (Pakistan format)
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{7})/, '$1-$2');
  }
  return phone;
}

// Age calculation
export function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date();
  const birthDate = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Generate avatar initials
export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Blood group options
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const SEX_OPTIONS = ['Male', 'Female', 'Other'] as const;
export const SMOKING_STATUS = ['Never', 'Former', 'Current'] as const;
export const CANCER_STAGES = ['I', 'II', 'III', 'IV'] as const;
export const CANCER_GRADES = ['1', '2', '3'] as const;
export const CANCER_TYPES = [
  'Breast Cancer',
  'Lung Cancer',
  'Colorectal Cancer',
  'Prostate Cancer',
  'Ovarian Cancer',
  'Gastric Cancer',
  'Pancreatic Cancer',
  'Liver Cancer',
  'Bladder Cancer',
  'Kidney Cancer',
  'Brain Tumor',
  'Lymphoma',
  'Leukemia',
  'Multiple Myeloma',
  'Sarcoma',
  'Oral Cancer',
  'Esophageal Cancer',
  'Cervical Cancer',
  'Endometrial Cancer',
  'Thyroid Cancer',
  'Other',
] as const;
export const REPORT_TYPES = ['pathology', 'imaging', 'lab', 'consultation', 'other'] as const;

// Imaging study types
export const STUDY_TYPES = [
  'CT',
  'MRI',
  'PET',
  'Ultrasound',
  'Mammogram',
  'Bone Scan',
  'Echo',
  'X-Ray',
] as const;

// Yes/No options
export const YES_NO_OPTIONS = ['yes', 'no'] as const;

// Report type labels
export const REPORT_TYPE_LABELS: Record<string, string> = {
  pathology: 'Pathology',
  imaging: 'Imaging',
  lab: 'Lab',
  consultation: 'Consultation',
  other: 'Other',
};

// Format habits summary
export function formatHabitsSummary(habits: {
  smoking_status?: string | null;
  smoking_quantity?: string | null;
}): string {
  if (!habits.smoking_status || habits.smoking_status === 'Never') {
    return 'Non-smoker';
  }
  if (habits.smoking_status === 'Former') {
    return habits.smoking_quantity
      ? `Former smoker - ${habits.smoking_quantity}`
      : 'Former smoker';
  }
  return habits.smoking_quantity
    ? `Current smoker - ${habits.smoking_quantity}`
    : 'Current smoker';
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
