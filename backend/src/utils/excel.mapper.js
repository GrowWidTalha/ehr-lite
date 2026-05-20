/**
 * Excel Column Mapping Configuration - New Schema (PascalCase/Integer)
 *
 * Maps Excel columns to Patient table (new denormalized schema).
 * Used by both import (Excel → DB) and export (DB → Excel) operations.
 *
 * @module excel.mapper
 */

/**
 * Mapping of Excel columns to Patient table fields.
 * Note: New schema is denormalized - most fields are in Patient table.
 * Habits and family history are in separate tables (PatientAddictions, FamilyHistory).
 */
export const EXCEL_COLUMN_MAPPING = {
  // =========================================================================
  // DEMOGRAPHICS (Patient table)
  // =========================================================================
  'Reg No': {
    table: 'Patient',
    field: 'RegistrationNo',
    required: false,
    type: 'string'
  },
  'Reg. Date': {
    table: 'Patient',
    field: 'RegistrationDate',
    required: false,
    type: 'date'
  },
  'Name & Sur Name': {
    table: 'Patient',
    field: 'PatientName',
    required: true,
    type: 'string'
  },
  'Age': {
    table: 'Patient',
    field: 'Age',
    required: true,
    type: 'integer',
    min: 0,
    max: 150
  },
  'Sex': {
    table: 'Patient',
    field: 'Gender',
    required: true,
    type: 'enum',
    values: ['M', 'F', 'm', 'f', 'Male', 'Female', 'Other'],
    mapToDb: (val) => {
      if (val === 'M' || val === 'm') return 'Male';
      if (val === 'F' || val === 'f') return 'Female';
      return val;
    }
  },
  'Marital Status': {
    table: 'Patient',
    field: 'MaritalStatus',
    required: false,
    type: 'enum',
    values: ['M', 'S', 'W', 'D', 'Widow', 'Married', 'Single', 'Divorced']
  },
  'Children': {
    table: 'Patient',
    field: 'NoOfChidren',
    required: false,
    type: 'integer',
    min: 0
  },
  'Sibling': {
    table: 'Patient',
    field: 'NoOfSibling',
    required: false,
    type: 'integer',
    min: 0
  },
  'Language': {
    table: 'Patient',
    field: 'MotherTongue', // Maps to lookup table ID in import
    required: false,
    type: 'string'
  },
  'Territory': {
    table: 'Patient',
    field: 'PlaceOfBirth', // Maps to lookup table ID in import
    required: false,
    type: 'string'
  },
  'Contact No': {
    table: 'Patient',
    field: 'ContactNo',
    required: false,
    type: 'string'
  },
  'CNIC NO': {
    table: 'Patient',
    field: 'CNICNo',
    required: false,
    type: 'string'
  },
  'Education': {
    table: 'Patient',
    field: 'Qualifications', // Maps to lookup table ID in import
    required: false,
    type: 'string'
  },

  // =========================================================================
  // VITALS (now in Patient table)
  // =========================================================================
  'Height': {
    table: 'Patient',
    field: 'Height',
    required: false,
    type: 'float',
    min: 0
  },
  'Weight': {
    table: 'Patient',
    field: 'Weight',
    required: false,
    type: 'float',
    min: 0
  },
  'Blood Group': {
    table: 'Patient',
    field: 'BloodGroup', // Maps to lookup table ID in import
    required: false,
    type: 'enum',
    values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },

  // =========================================================================
  // HISTORY (now in Patient table or separate tables)
  // =========================================================================
  'History': {
    table: 'Patient',
    field: 'PresentAddress', // Using available field - may need custom handling
    required: false,
    type: 'text'
  },
  'DM - HTN/IHD - HCV/HBV - Others': {
    table: 'Patient',
    field: 'MedicalTreatmentSpecify', // Using available field
    required: false,
    type: 'string'
  },
  'Family History of Cancer': {
    table: 'FamilyHistory', // Separate table
    field: 'Diseases', // Will be mapped to lookup table
    required: false,
    type: 'string',
    isRelation: true
  },

  // =========================================================================
  // HABITS (now in PatientAddictions table)
  // =========================================================================
  'Smoking': {
    table: 'PatientAddictions',
    field: 'Addiction',
    required: false,
    type: 'lookup',
    lookupValue: 'Smoking',
    durationField: 'Quantity'
  },
  'Quantity': {
    table: 'PatientAddictions',
    field: 'Notes',
    required: false,
    type: 'string',
    habitType: 'Smoking'
  },
  'Pan': {
    table: 'PatientAddictions',
    field: 'Addiction',
    required: false,
    type: 'lookup',
    lookupValue: 'Pan',
    durationField: 'Quantity2'
  },
  'Quantity2': {
    table: 'PatientAddictions',
    field: 'Notes',
    required: false,
    type: 'string',
    habitType: 'Pan'
  },
  'Gutka': {
    table: 'PatientAddictions',
    field: 'Addiction',
    required: false,
    type: 'lookup',
    lookupValue: 'Gutka',
    durationField: 'Quantity3'
  },
  'Quantity3': {
    table: 'PatientAddictions',
    field: 'Notes',
    required: false,
    type: 'string',
    habitType: 'Gutka'
  },
  'Naswar': {
    table: 'PatientAddictions',
    field: 'Addiction',
    required: false,
    type: 'lookup',
    lookupValue: 'Naswar',
    durationField: 'Quantity4'
  },
  'Quantity4': {
    table: 'PatientAddictions',
    field: 'Notes',
    required: false,
    type: 'string',
    habitType: 'Naswar'
  },
  'Alcohol': {
    table: 'PatientAddictions',
    field: 'Addiction',
    required: false,
    type: 'lookup',
    lookupValue: 'Alcohol',
    durationField: 'Quantity5'
  },
  'Quantity5': {
    table: 'PatientAddictions',
    field: 'Notes',
    required: false,
    type: 'string',
    habitType: 'Alcohol'
  },
  'Others': {
    table: 'PatientAddictions',
    field: 'Addiction',
    required: false,
    type: 'lookup',
    lookupValue: 'Other'
  },
  'Quit Period': {
    table: 'Patient',
    field: 'PreviousTreatment', // Using available field
    required: false,
    type: 'string'
  },

  // =========================================================================
  // DIAGNOSIS (now flags in Patient table)
  // =========================================================================
  'Type of Cancer': {
    table: 'Patient',
    field: 'CancerTypeField', // Maps to specific cancer type field
    required: false,
    type: 'string',
    mapToField: (val) => {
      const typeMap = {
        'Brain Tumor': 'BrainTumor',
        'Head & Neck': 'HeadAndNeck',
        'Breast': 'BreastCancer',
        'Genitourinary': 'Genitourinary',
        'Gynecological': 'Gyneacological',
        'Lungs': 'LungsCancer',
        'GI': 'GITumor',
        'Skin': 'SkinTumor',
        'Hematological': 'Hematological',
        'Sarcoma': 'Sarcoma',
        'Carcinoma': 'Carcinoma'
      };
      // Determine which field to set based on cancer type
      for (const [key, value] of Object.entries(typeMap)) {
        if (val.includes(key)) return { field: value, value: val };
      }
      return { field: 'Carcinoma', value: val };
    }
  },
  'Stage': {
    table: 'Patient',
    field: 'StatingTest', // Using available field for stage info
    required: false,
    type: 'enum',
    values: ['Stage-0', 'Stage-1', 'Stage-2', 'Stage-3', 'Stage-4', 'Stage-I', 'Stage-II', 'Stage-III', 'Stage-IV']
  },
  'Grade': {
    table: 'Patient',
    field: 'Grade',
    required: false,
    type: 'enum',
    values: ['Grade-1', 'Grade-2', 'Grade-3', 'Grade-X']
  },
  'WHO': {
    table: 'Patient',
    field: 'WhoClassification', // May need to be added or use alternate field
    required: false,
    type: 'integer',
    min: 1,
    max: 4
  },

  // =========================================================================
  // PREVIOUS TREATMENTS (flags in Patient table)
  // =========================================================================
  'Previous Chemo': {
    table: 'Patient',
    field: 'PreviousTreatment',
    required: false,
    type: 'string'
  },
  'Previous RT': {
    table: 'Patient',
    field: 'RadioTherapy',
    required: false,
    type: 'string'
  },
  'Previous Targeted / TKI Therapy': {
    table: 'Patient',
    field: 'TargettedTherapy',
    required: false,
    type: 'string'
  },

  // =========================================================================
  // TREATMENT (now in Patient table)
  // =========================================================================
  'Surgery': {
    table: 'Patient',
    field: 'SurgicalProcedure',
    required: false,
    type: 'string'
  },
  'Surgery Date': {
    table: 'Patient',
    field: 'SurgicalDate',
    required: false,
    type: 'date'
  },
  'Chemotherapy': {
    table: 'Patient',
    field: 'ChemoRegimen',
    required: false,
    type: 'string'
  },
  'Cycles': {
    table: 'Patient',
    field: 'Cycles',
    required: false,
    type: 'string'
  },
  'Radiotherapy': {
    table: 'Patient',
    field: 'Dose',
    required: false,
    type: 'string'
  },
  'Hormonal Therapy': {
    table: 'Patient',
    field: 'HormonalTherapy',
    required: false,
    type: 'string'
  },

  // =========================================================================
  // TNM STAGING (Patient table fields)
  // =========================================================================
  'T': {
    table: 'Patient',
    field: 'TNM',
    required: false,
    type: 'string'
  },
  'N': {
    table: 'Patient',
    field: 'NodesInvolved',
    required: false,
    type: 'string'
  },
  'M': {
    table: 'Patient',
    field: 'Metastasis',
    required: false,
    type: 'string'
  },

  // =========================================================================
  // HOSPITAL/DOCTOR INFO (Patient table)
  // =========================================================================
  'Hospital': {
    table: 'Patient',
    field: 'Hospital', // Lookup table ID
    required: false,
    type: 'string'
  },
  'Doctor Name': {
    table: 'Patient',
    field: 'DoctorName',
    required: false,
    type: 'string'
  },
  'Examination Date': {
    table: 'Patient',
    field: 'ExaminationDate',
    required: false,
    type: 'date'
  },

  // =========================================================================
  // OUTCOME (Patient table)
  // =========================================================================
  'Outcome': {
    table: 'Patient',
    field: 'OutComeOfTreatment',
    required: false,
    type: 'string'
  },
  'Follow Up': {
    table: 'Patient',
    field: 'FollowUp',
    required: false,
    type: 'integer',
    mapToDb: (val) => val === 'Y' || val === 'Yes' || val === 1 ? 1 : 0
  }
};

/**
 * Reverse mapping for export (DB → Excel)
 */
export const DB_TO_EXCEL_MAPPING = {
  // Patient table fields
  'PatientID': 'Reg No', // Internal ID, not typically exported
  'RegistrationNo': 'Reg No',
  'RegistrationDate': 'Reg. Date',
  'PatientName': 'Name & Sur Name',
  'Age': 'Age',
  'Gender': 'Sex',
  'MaritalStatus': 'Marital Status',
  'NoOfChidren': 'Children',
  'NoOfSibling': 'Sibling',
  'ContactNo': 'Contact No',
  'CNICNo': 'CNIC NO',
  'Height': 'Height',
  'Weight': 'Weight',
  'DoctorName': 'Doctor Name',
  'ExaminationDate': 'Examination Date',
  'OutComeOfTreatment': 'Outcome',
  'FollowUp': 'Follow Up',
  'Grade': 'Grade',
  'TNM': 'T',
  'NodesInvolved': 'N',
  'Metastasis': 'M'
};

/**
 * Fields that require lookup table resolution
 */
export const LOOKUP_FIELDS = {
  'BloodGroup': 'BloodGroups',
  'Hospital': 'Hospitals',
  'Qualifications': 'Qualifications',
  'Occupation': 'Occupation',
  'MotherTongue': 'MotherTongue',
  'PlaceOfBirth': 'District',
  'Sports': 'Sports'
};

export default EXCEL_COLUMN_MAPPING;
