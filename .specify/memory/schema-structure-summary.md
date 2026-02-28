# EHR Lite Schema Structure Summary

**Version**: 1.1.0
**Date**: 2026-02-24
**Total Tables**: 13

---

## Quick Reference

### Entity Cardinality

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PATIENT (1 record)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ id, name, age, sex, phone, cnic, registration_number, etc.          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬───────────────┬────────────────┐
     │               │               │               │                │
     ▼               ▼               ▼               ▼                ▼
┌─────────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐    ┌───────────┐
│Vitals   │    │History   │   │Habits    │   │Diagnoses │    │Reports    │
│(MANY)   │    │(1)       │   │(1)       │   │(MANY)    │    │(MANY)     │
│✓Images  │    │✓Images   │   │          │   │          │    │✓Images    │
└─────────┘    └──────────┘   └──────────┘   └────┬─────┘    └───────────┘
                                                │
           ┌────────────┬────────────┬─────────┼─────────┬──────────┐
           │            │            │         │         │          │
           ▼            ▼            ▼         ▼         ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐ ┌─────────┐
    │Prev Tx   │ │Pathology │ │Biomarker │ │Imaging│ │Tx Plan  │ │Tx Sess  │
    │(MANY)    │ │(MANY)    │ │(MANY)    │ │(MANY)│ │(1)       │ │(MANY)   │
    │✓Images   │ │✓Images   │ │✓Images   │ │✓Img  │ │          │ │✓Images  │
    └──────────┘ └──────────┘ └──────────┘ └──────┘ └──────────┘ └─────────┘
                                                    │
                                                    ▼
                                             ┌──────────┐
                                             │Sessions  │
                                             │(MANY)    │
                                             │✓Images   │
                                             └──────────┘
```

---

## Tables by Category

### Core Patient Data (4 tables)
| Table | Records Per Patient | Image Support | Excel Source |
|-------|---------------------|---------------|--------------|
| **patients** | 1 | ❌ | Reg No, Name, Age, Sex, Phone, CNIC, etc. |
| **patient_vitals** | Multiple | ✅ | Height, Weight, Blood Group |
| **patient_history** | 1 | ✅ | History, Comorbidities, Family History |
| **patient_habits** | 1 | ❌ | Smoking, Tobacco, Alcohol use |

### Oncology Core (1 table)
| Table | Records Per Patient | Image Support | Excel Source |
|-------|---------------------|---------------|--------------|
| **cancer_diagnoses** | Multiple | ❌ | Cancer Type, Stage, Grade, WHO |

### Previous Records (1 table)
| Table | Records Per Diagnosis | Image Support | Excel Source |
|-------|----------------------|---------------|--------------|
| **previous_treatments** | Multiple | ✅ | Previous Chemo, RT, Surgery, etc. |

### Diagnostic Reports (3 tables)
| Table | Records Per Diagnosis | Image Support | Excel Source |
|-------|----------------------|---------------|--------------|
| **pathology_reports** | Multiple | ✅ | Pathological Stage, Tumor Size, LVI, PNI, Nodes |
| **biomarker_tests** | Multiple | ✅ | ER, PR, HER2, Ki-67, IHC Markers |
| **imaging_studies** | Multiple | ✅ | CT, MRI, PET, US, Mammogram, Bone Scan, Echo, BSC |

### Treatment (2 tables)
| Table | Records Per Diagnosis | Image Support | Excel Source |
|-------|----------------------|---------------|--------------|
| **treatment_plans** | 1 | ❌ | Plan, Surgery, Radical, Palliative, Neo ADJ, ADJ |
| **treatment_sessions** | Multiple | ✅ | Chemo, Hormonal, Targeted, RT, Brachy, Immuno |

### Documents (2 tables)
| Table | Records Per Patient | Image Support | Purpose |
|-------|---------------------|---------------|---------|
| **reports** | Multiple | ✅ | General document storage |
| **report_images** | Unlimited | N/A | Universal image storage for ALL entities |

---

## Image Support Matrix

### ✅ Supports Multiple Images (via report_images table)

| Entity | Image Use Cases | Entity Type for API |
|--------|-----------------|-------------------|
| **patient_vitals** | Vitals chart, exam notes | `'patient_vitals'` |
| **patient_history** | Referral letters, summaries | `'patient_history'` |
| **previous_treatments** | External treatment summaries, prior hospital records | `'previous_treatments'` |
| **pathology_reports** | Biopsy reports, pathology slips, surgical reports | `'pathology_reports'` |
| **biomarker_tests** | IHC reports, lab results, marker panels | `'biomarker_tests'` |
| **imaging_studies** | CT/MRI/PET reports, films, radiology printouts | `'imaging_studies'` |
| **treatment_sessions** | Chemo orders, infusion records, treatment cards | `'treatment_sessions'` |
| **reports** | General documents, ID cards, insurance | `'reports'` |

### ❌ No Image Support (data entry only)

| Table | Reason |
|-------|--------|
| **patients** | Demographics - no documents needed |
| **patient_habits** | Habits - quick data entry |
| **cancer_diagnoses** | Diagnosis metadata - images linked to reports |
| **treatment_plans** | Planning metadata - images linked to sessions |

---

## Key Features

### 1. Multiple Images Per Record
```
One imaging_study → Multiple CT scan reports over time
One pathology_report → Biopsy + Surgical + Re-excision images
One biomarker_test → Initial IHC + Repeat HER2 + Ki67 images
```

### 2. Flexible Image Storage
```
report_images table stores:
- entity_type (which table)
- entity_id (which record)
- image_path (file location)
- sequence (display order)
- caption (description)
```

### 3. Multiple Vitals Per Patient
Track weight changes over time, multiple visits.

### 4. Multiple Diagnoses Per Patient
New primaries, recurrences, second cancers.

---

## File Organization

```
/data/patient-images/{patient_uuid}/
├── imaging-{record_id}-{seq}.jpg       ← Imaging studies
├── pathology-{record_id}-{seq}.jpg    ← Pathology reports
├── biomarker-{record_id}-{seq}.jpg    ← Lab/IHC reports
├── treatment-{record_id}-{seq}.jpg    ← Treatment records
├── prev-tx-{record_id}-{seq}.jpg      ← Previous treatment summaries
├── history-{record_id}-{seq}.jpg      ← Referral documents
├── vitals-{record_id}-{seq}.jpg       ← Vitals charts
└── general-{record_id}-{seq}.jpg      ← General documents
```

---

## Data Flow Example

```
1. Register Patient
   → patients table (name, age, contact)

2. Add Cancer Diagnosis
   → cancer_diagnoses table (type, stage, grade)

3. Upload CT Scan Report
   → imaging_studies (study_type='CT', findings)
   → report_images (entity_type='imaging_studies', entity_id=abc-123, image_path=...)

4. Upload Another CT Scan (Follow-up)
   → NEW imaging_studies record
   → NEW report_images record

5. Upload Biopsy Report
   → pathology_reports (tumor_size, margins, etc.)
   → report_images (entity_type='pathology_reports', ...)
```

---

## Implementation Checklist

- [x] Schema designed with 13 tables
- [x] Universal image storage via report_images table
- [x] Multiple images per record support
- [x] Multiple vitals per patient support
- [x] Multiple diagnoses per patient support
- [x] Indexes defined for common queries
- [x] Views defined for summary queries
- [ ] Drizzle ORM implementation
- [ ] API endpoints for each table
- [ ] Image upload API (single and batch)
- [ ] Frontend forms for data entry
- [ ] Camera integration for image capture
