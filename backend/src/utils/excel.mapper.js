/**
 * Excel Column Mapping Configuration
 *
 * Maps 82 columns from Onco Excel format to normalized database schema.
 * Used by both import (Excel → DB) and export (DB → Excel) operations.
 *
 * @module excel.mapper
 */

/**
 * Complete mapping of all 82 Excel columns to database tables and fields.
 *
 * For import: Each mapping defines how to extract and validate Excel data
 * For export: Reverse mapping converts normalized DB data back to flat Excel
 */
export const EXCEL_COLUMN_MAPPING = {
  // =========================================================================
  // DEMOGRAPHICS (patients table)
  // =========================================================================
  'Reg No': {
    table: 'patients',
    field: 'registration_number',
    required: false,
    type: 'string'
  },
  'Reg. Date': {
    table: 'patients',
    field: 'registration_date',
    required: false,
    type: 'date'
  },
  'Name & Sur Name': {
    table: 'patients',
    field: 'full_name',
    required: true,
    type: 'string'
  },
  'Age': {
    table: 'patients',
    field: 'age',
    required: true,
    type: 'integer',
    min: 0,
    max: 150
  },
  'Sex': {
    table: 'patients',
    field: 'sex',
    required: true,
    type: 'enum',
    values: ['M', 'F', 'm', 'f']
  },
  'Marital Status': {
    table: 'patients',
    field: 'marital_status',
    required: false,
    type: 'enum',
    values: ['M', 'S', 'W', 'D', 'Widow']
  },
  'Children': {
    table: 'patients',
    field: 'children_count',
    required: false,
    type: 'integer',
    min: 0
  },
  'Sibling': {
    table: 'patients',
    field: 'siblings_count',
    required: false,
    type: 'integer',
    min: 0
  },
  'Language': {
    table: 'patients',
    field: 'language',
    required: false,
    type: 'string'
  },
  'Territory': {
    table: 'patients',
    field: 'territory',
    required: false,
    type: 'string'
  },
  'Contact No': {
    table: 'patients',
    field: 'contact_number',
    required: false,
    type: 'string'
  },
  'CNIC NO': {
    table: 'patients',
    field: 'cnic_number',
    required: false,
    type: 'string'
  },
  'Education': {
    table: 'patients',
    field: 'education',
    required: false,
    type: 'string'
  },

  // =========================================================================
  // VITALS (patient_vitals table)
  // =========================================================================
  'Height': {
    table: 'patient_vitals',
    field: 'height_cm',
    required: false,
    type: 'float',
    min: 0
  },
  'Weight': {
    table: 'patient_vitals',
    field: 'weight_kg',
    required: false,
    type: 'float',
    min: 0
  },
  'Blood Group': {
    table: 'patient_vitals',
    field: 'blood_group',
    required: false,
    type: 'enum',
    values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },

  // =========================================================================
  // HISTORY (patient_history table)
  // =========================================================================
  'History': {
    table: 'patient_history',
    field: 'medical_history',
    required: false,
    type: 'text'
  },
  'DM - HTN/IHD - HCV/HBV - Others': {
    table: 'patient_history',
    field: 'comorbidities',
    required: false,
    type: 'string'
  },
  'Family History of Cancer': {
    table: 'patient_history',
    field: 'family_cancer_history',
    required: false,
    type: 'string'
  },

  // =========================================================================
  // HABITS (patient_habits table - multiple records per patient)
  // For habits, the mapping is more complex as multiple habit records exist
  // =========================================================================
  'Smoking': {
    table: 'patient_habits',
    field: 'habit_type',
    required: false,
    type: 'constant',
    constant: 'smoking',
    durationField: 'Quantity'
  },
  'Quantity': {
    table: 'patient_habits',
    field: 'duration',
    required: false,
    type: 'string',
    habitType: 'smoking'
  },
  'Pan': {
    table: 'patient_habits',
    field: 'habit_type',
    required: false,
    type: 'constant',
    constant: 'pan',
    durationField: 'Quantity2'
  },
  'Quantity2': {
    table: 'patient_habits',
    field: 'duration',
    required: false,
    type: 'string',
    habitType: 'pan'
  },
  'Gutka': {
    table: 'patient_habits',
    field: 'habit_type',
    required: false,
    type: 'constant',
    constant: 'gutka',
    durationField: 'Quantity3'
  },
  'Quantity3': {
    table: 'patient_habits',
    field: 'duration',
    required: false,
    type: 'string',
    habitType: 'gutka'
  },
  'Naswar': {
    table: 'patient_habits',
    field: 'habit_type',
    required: false,
    type: 'constant',
    constant: 'naswar',
    durationField: 'Quantity4'
  },
  'Quantity4': {
    table: 'patient_habits',
    field: 'duration',
    required: false,
    type: 'string',
    habitType: 'naswar'
  },
  'Alcohol': {
    table: 'patient_habits',
    field: 'habit_type',
    required: false,
    type: 'constant',
    constant: 'alcohol',
    durationField: 'Quantity5'
  },
  'Quantity5': {
    table: 'patient_habits',
    field: 'duration',
    required: false,
    type: 'string',
    habitType: 'alcohol'
  },
  'Others': {
    table: 'patient_habits',
    field: 'habit_type',
    required: false,
    type: 'constant',
    constant: 'other',
    durationField: null
  },
  'Quit Period': {
    table: 'patient_habits',
    field: 'quit_period',
    required: false,
    type: 'string'
  },

  // =========================================================================
  // DIAGNOSIS (cancer_diagnoses table)
  // =========================================================================
  'Type of Cancer': {
    table: 'cancer_diagnoses',
    field: 'cancer_type',
    required: false,
    type: 'string'
  },
  'Stage': {
    table: 'cancer_diagnoses',
    field: 'stage',
    required: false,
    type: 'enum',
    values: ['Stage-0', 'Stage-1', 'Stage-2', 'Stage-3', 'Stage-4', 'Stage-I', 'Stage-II', 'Stage-III', 'Stage-IV']
  },
  'Grade': {
    table: 'cancer_diagnoses',
    field: 'grade',
    required: false,
    type: 'enum',
    values: ['Grade-1', 'Grade-2', 'Grade-3', 'Grade-X']
  },
  'WHO': {
    table: 'cancer_diagnoses',
    field: 'who_classification',
    required: false,
    type: 'integer',
    min: 1,
    max: 4
  },

  // =========================================================================
  // PREVIOUS TREATMENTS (previous_treatments table - multiple records)
  // =========================================================================
  'Previous Chemo': {
    table: 'previous_treatments',
    field: 'treatment_type',
    required: false,
    type: 'constant',
    constant: 'chemotherapy'
  },
  'Previous RT': {
    table: 'previous_treatments',
    field: 'treatment_type',
    required: false,
    type: 'constant',
    constant: 'radiation_therapy'
  },
  'Previous Targeted / TKI Therapy': {
    table: 'previous_treatments',
    field: 'treatment_type',
    required: false,
    type: 'constant',
    constant: 'targeted_therapy'
  },
  'Previous HT': {
    table: 'previous_treatments',
    field: 'treatment_type',
    required: false,
    type: 'constant',
    constant: 'hormonal_therapy'
  },
  'Previous IT': {
    table: 'previous_treatments',
    field: 'treatment_type',
    required: false,
    type: 'constant',
    constant: 'immunotherapy'
  },
  'Surgery Other Than Cancer': {
    table: 'previous_treatments',
    field: 'treatment_type',
    required: false,
    type: 'constant',
    constant: 'other_surgery'
  },
  'Previous Surgery': {
    table: 'previous_treatments',
    field: 'surgery_details',
    required: false,
    type: 'text'
  },
  '2nd Surgery': {
    table: 'previous_treatments',
    field: 'second_surgery_details',
    required: false,
    type: 'text'
  },

  // =========================================================================
  // PATHOLOGY (pathology_reports table)
  // =========================================================================
  'Pathological Stage': {
    table: 'pathology_reports',
    field: 'pathological_stage',
    required: false,
    type: 'string'
  },
  'Tumor Size': {
    table: 'pathology_reports',
    field: 'tumor_size',
    required: false,
    type: 'string'
  },
  'Depth': {
    table: 'pathology_reports',
    field: 'depth',
    required: false,
    type: 'string'
  },
  'Margins': {
    table: 'pathology_reports',
    field: 'margins',
    required: false,
    type: 'enum',
    values: ['Clear', 'Close', 'Positive', 'N/A', 'R1', 'R0']
  },
  'LVI': {
    table: 'pathology_reports',
    field: 'lymphovascular_invasion',
    required: false,
    type: 'enum',
    values: ['Present', 'Absent', 'N/A', '+', '-']
  },
  'PNI': {
    table: 'pathology_reports',
    field: 'perineural_invasion',
    required: false,
    type: 'enum',
    values: ['Present', 'Absent', 'N/A', '+', '-']
  },
  'Nodes Recover': {
    table: 'pathology_reports',
    field: 'nodes_recovered',
    required: false,
    type: 'integer',
    min: 0
  },
  'Nodes Involved': {
    table: 'pathology_reports',
    field: 'nodes_involved',
    required: false,
    type: 'integer',
    min: 0
  },
  'Extra Node Ext': {
    table: 'pathology_reports',
    field: 'extranodal_extension',
    required: false,
    type: 'enum',
    values: ['Present', 'Absent', 'N/A', '+', '-']
  },
  'Adequate.  Inadequate Surgery': {
    table: 'pathology_reports',
    field: 'surgery_adequacy',
    required: false,
    type: 'enum',
    values: ['Adequate', 'Inadequate', 'N/A']
  },
  'Recurence': {
    table: 'pathology_reports',
    field: 'recurrence',
    required: false,
    type: 'enum',
    values: ['Yes', 'No', 'N/A', 'Y', 'N']
  },

  // =========================================================================
  // BIOMARKERS (biomarker_tests table)
  // =========================================================================
  'ER': {
    table: 'biomarker_tests',
    field: 'er_status',
    required: false,
    type: 'enum',
    values: ['Positive', 'Negative', 'N/A', '+', '-']
  },
  'PR': {
    table: 'biomarker_tests',
    field: 'pr_status',
    required: false,
    type: 'enum',
    values: ['Positive', 'Negative', 'N/A', '+', '-']
  },
  'Her2-U': {
    table: 'biomarker_tests',
    field: 'her2_status',
    required: false,
    type: 'enum',
    values: ['Positive', 'Negative', 'Equivocal', 'N/A', '+', '+++', '++', '+', '0', '1+', '2+', '3+']
  },
  'Ki-67': {
    table: 'biomarker_tests',
    field: 'ki67_percentage',
    required: false,
    type: 'integer',
    min: 0,
    max: 100
  },
  'Mitosis/10HPF': {
    table: 'biomarker_tests',
    field: 'mitosis_count',
    required: false,
    type: 'integer',
    min: 0
  },
  'IHC Markers / Tumor Markers': {
    table: 'biomarker_tests',
    field: 'other_markers',
    required: false,
    type: 'text'
  },

  // =========================================================================
  // IMAGING (imaging_studies table - multiple records)
  // =========================================================================
  'Ct Scane': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'ct_scan'
  },
  'MRI': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'mri'
  },
  'Pet Scane': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'pet_scan'
  },
  'U/Sound': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'ultrasound'
  },
  'Mammogram': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'mammogram'
  },
  'Bone Scane': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'bone_scan'
  },
  'Echo': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'echocardiogram'
  },
  'BSC': {
    table: 'imaging_studies',
    field: 'imaging_type',
    required: false,
    type: 'constant',
    constant: 'bsc'
  },

  // =========================================================================
  // TREATMENT PLAN (treatment_plans table)
  // =========================================================================
  'Plan': {
    table: 'treatment_plans',
    field: 'treatment_plan',
    required: false,
    type: 'string'
  },
  'Surgery': {
    table: 'treatment_plans',
    field: 'surgery_planned',
    required: false,
    type: 'boolean',
    truthyValues: ['Yes', 'Y', 'true', '1'],
    falsyValues: ['No', 'N', 'false', '0', 'N/A', '']
  },
  'Radical': {
    table: 'treatment_plans',
    field: 'radical_surgery',
    required: false,
    type: 'boolean',
    truthyValues: ['Yes', 'Y', 'true', '1'],
    falsyValues: ['No', 'N', 'false', '0', 'N/A', '']
  },
  'Pallative': {
    table: 'treatment_plans',
    field: 'palliative_care',
    required: false,
    type: 'boolean',
    truthyValues: ['Yes', 'Y', 'true', '1'],
    falsyValues: ['No', 'N', 'false', '0', 'N/A', '']
  },
  'Neo ADJ': {
    table: 'treatment_plans',
    field: 'neoadjuvant_therapy',
    required: false,
    type: 'boolean',
    truthyValues: ['Yes', 'Y', 'true', '1'],
    falsyValues: ['No', 'N', 'false', '0', 'N/A', '']
  },
  'ADJ': {
    table: 'treatment_plans',
    field: 'adjuvant_therapy',
    required: false,
    type: 'boolean',
    truthyValues: ['Yes', 'Y', 'true', '1'],
    falsyValues: ['No', 'N', 'false', '0', 'N/A', '']
  },
  'Induction Chemo': {
    table: 'treatment_plans',
    field: 'induction_chemotherapy',
    required: false,
    type: 'boolean',
    truthyValues: ['Yes', 'Y', 'true', '1'],
    falsyValues: ['No', 'N', 'false', '0', 'N/A', '']
  },
  'Chemotherapy': {
    table: 'treatment_plans',
    field: 'chemotherapy_regimen',
    required: false,
    type: 'string'
  },
  'Hormonal Therapy': {
    table: 'treatment_plans',
    field: 'hormonal_therapy',
    required: false,
    type: 'string'
  },
  'Targeted Therapy / TKI': {
    table: 'treatment_plans',
    field: 'targeted_therapy',
    required: false,
    type: 'string'
  },
  'Radio Therapy': {
    table: 'treatment_plans',
    field: 'radiation_therapy',
    required: false,
    type: 'string'
  },
  'Brachy Therapy': {
    table: 'treatment_plans',
    field: 'brachytherapy',
    required: false,
    type: 'string'
  },
  'Immuno Theray': {
    table: 'treatment_plans',
    field: 'immunotherapy',
    required: false,
    type: 'string'
  }
};

/**
 * Helper function to get all columns that map to a specific table
 *
 * @param {string} tableName - The database table name
 * @returns {Array} Array of column mappings for the table
 */
export function getColumnsForTable(tableName) {
  return Object.entries(EXCEL_COLUMN_MAPPING)
    .filter(([_, mapping]) => mapping.table === tableName)
    .map(([columnName, mapping]) => ({ columnName, ...mapping }));
}

/**
 * Helper function to get all required columns
 *
 * @returns {Array} Array of required column mappings
 */
export function getRequiredColumns() {
  return Object.entries(EXCEL_COLUMN_MAPPING)
    .filter(([_, mapping]) => mapping.required === true)
    .map(([columnName, mapping]) => ({ columnName, ...mapping }));
}

/**
 * Helper function to validate a value based on mapping rules
 *
 * @param {*} value - The value to validate
 * @param {Object} mapping - The column mapping configuration
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateValue(value, mapping) {
  // Empty values are allowed (treated as null)
  if (value === null || value === undefined || value === '') {
    return { valid: true, error: null };
  }

  // Type validation
  switch (mapping.type) {
    case 'integer':
      if (isNaN(value) || !Number.isInteger(Number(value))) {
        return { valid: false, error: `Must be an integer` };
      }
      if (mapping.min !== undefined && Number(value) < mapping.min) {
        return { valid: false, error: `Must be at least ${mapping.min}` };
      }
      if (mapping.max !== undefined && Number(value) > mapping.max) {
        return { valid: false, error: `Must be at most ${mapping.max}` };
      }
      break;

    case 'float':
      if (isNaN(value) || isNaN(parseFloat(value))) {
        return { valid: false, error: `Must be a number` };
      }
      if (mapping.min !== undefined && Number(value) < mapping.min) {
        return { valid: false, error: `Must be at least ${mapping.min}` };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' &&
          !mapping.truthyValues?.includes(value) &&
          !mapping.falsyValues?.includes(value)) {
        return { valid: false, error: `Must be yes/no or true/false` };
      }
      break;

    case 'enum':
      const normalizedValue = String(value).trim();
      if (mapping.values) {
        const valid = mapping.values.some(v =>
          v.toLowerCase() === normalizedValue.toLowerCase()
        );
        if (!valid) {
          return { valid: false, error: `Must be one of: ${mapping.values.join(', ')}` };
        }
      }
      break;

    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, error: `Must be a valid date` };
      }
      break;
  }

  return { valid: true, error: null };
}

/**
 * Helper function to get all Excel column names
 *
 * @returns {Array} Array of all 82 Excel column names
 */
export function getAllExcelColumns() {
  return Object.keys(EXCEL_COLUMN_MAPPING);
}

export default EXCEL_COLUMN_MAPPING;
