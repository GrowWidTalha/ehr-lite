# Quickstart: Excel Data Operations & Automated Backup

**Feature**: 002-excel-data-ops
**Last Updated**: 2026-03-02

## Overview

This guide helps you use the Excel import/export and automated backup features in EHR Lite.

---

## For Developers

### Prerequisites

```bash
# Ensure backend dependencies are installed
cd backend
npm install xlsx node-schedule archiver

# Or add to package.json and run npm install
```

### Running the Import Script

The import script is used for one-time migration of existing Excel data to the database.

```bash
# From project root
cd backend
node scripts/import-excel.js ../data/Onco-2025.xlsx
```

**Script Behavior**:
1. Validates Excel file structure (required columns)
2. Validates each row (name, age, sex required)
3. Shows validation summary with any errors
4. Prompts for confirmation if errors found
5. Imports valid rows to database
6. Creates log file at `/data/logs/import-YYYY-MM-DD.json`

**Interactive Prompts**:
```
Excel file: ../data/Onco-2025.xlsx
Reading file... 250 rows found

Validation complete:
✓ 245 rows valid
✗ 5 rows have errors

Errors:
  Row 12: Age value invalid (must be 0-150)
  Row 47: Name & Sur Name is required
  Row 89: Sex must be 'M' or 'F'
  Row 134: Age is required
  Row 201: Name & Sur Name is required

Continue with valid rows only? (5 rows will be skipped) [y/N]: y

Importing 245 records...
████████████████████████████████████████░░ 90%

Import complete:
  Processed: 250 rows
  Imported: 245 patients
  Skipped: 5 rows
  Duration: 23.5 seconds

Log saved to: /data/logs/import-2026-03-02.json
```

### Testing Export Endpoint

```bash
# Start backend server
cd backend
npm start

# In another terminal, test export
curl http://localhost:4000/api/export/patients -o test-export.xlsx

# Or use PowerShell
Invoke-WebRequest -Uri "http://localhost:4000/api/export/patients" -OutFile "test-export.xlsx"
```

### Testing Backup Endpoints

```bash
# Get backup status
curl http://localhost:4000/api/backup/status

# Create manual backup
curl -X POST http://localhost:4000/api/backup/create

# List all backups
curl http://localhost:4000/api/backup/list
```

---

## For End Users

### Exporting Patient Data to Excel

**Method 1: From Dashboard**

1. Open EHR Lite in browser (http://localhost:3000)
2. On the dashboard, click **"Export to Excel"** button
3. Excel file downloads automatically: `ehr-export-YYYY-MM-DD-HHMMSS.xlsx`

**Method 2: From Patients List**

1. Navigate to **Patients** page
2. Click **"Export All to Excel"** button (top right)
3. Excel file downloads automatically

**Export Contents**:
- All patient records with complete data
- 82 columns matching Onco Excel format
- Includes demographics, vitals, history, habits, diagnoses, treatments

### Automatic Daily Backups

**How It Works**:
- Backups run automatically at **2:00 AM** daily (configurable)
- Backups stored at: `/data/backups/YYYY-MM-DD/backup-HHMMSS.zip`
- Includes: `database.db` + entire `patient-images/` folder
- Backups are kept indefinitely (no automatic deletion)

**View Backup Status**:

1. Navigate to **Settings** page
2. See **Backup Status** section showing:
   - Last backup time
   - Backup size
   - Number of backups available
   - Next scheduled backup time

**Create Manual Backup**:

1. Navigate to **Settings** page
2. Click **"Backup Now"** button
3. Wait for completion message
4. Backup created with timestamp

**Backup File Locations**:
```
/data/
└── backups/
    ├── index.json                    # Backup inventory
    ├── 2026-03-01/
    │   └── backup-020000.zip        # March 1 backup
    ├── 2026-03-02/
    │   └── backup-020000.zip        # March 2 backup
    └── 2026-03-03/
        └── backup-020000.zip        # March 3 backup
```

### Restoring from Backup

**Note**: Restore functionality is not included in this feature. To restore:

1. Stop the EHR Lite application
2. Navigate to `/data/` folder
3. Backup current `database.db` (rename to `database.db.backup`)
4. Copy `database.db` from backup archive to `/data/`
5. Copy `patient-images/` folder from backup archive to `/data/`
6. Restart EHR Lite application

---

## Troubleshooting

### Import Issues

**Problem**: "Required columns missing" error
**Solution**: Verify Excel file has these exact column names:
- Name & Sur Name
- Age
- Sex

**Problem**: Import runs slowly
**Solution**: For large files (>5,000 rows), the script may take several minutes. Progress bar shows completion percentage.

**Problem**: Script can't find Excel file
**Solution**: Use absolute path or path relative to backend directory:
```bash
# Absolute path
node scripts/import-excel.js C:/Users/YourName/Documents/Onco-2025.xlsx

# Relative to project root
node backend/scripts/import-excel.js ./data/Onco-2025.xlsx
```

### Export Issues

**Problem**: Export button doesn't respond
**Solution**: Check backend server is running at http://localhost:4000

**Problem**: Downloaded Excel file is corrupted
**Solution**: Check browser console for errors. May indicate backend issue - check server logs.

**Problem**: Export takes too long
**Solution**: For 1,000+ patients, export may take 30-60 seconds. Progress indicator shows in browser.

### Backup Issues

**Problem**: "Backup failed - insufficient disk space"
**Solution**: Free up disk space or delete old backups from `/data/backups/`

**Problem**: Automatic backup didn't run
**Solution**:
1. Check if application was running at scheduled time
2. Check Settings page for backup status
3. See server logs for error messages

**Problem**: Manual backup button disabled
**Solution**: Another backup may be in progress. Wait for current backup to complete.

---

## Configuration

### Change Backup Schedule

Edit `/backend/src/jobs/backup.job.js`:

```javascript
// Default: Daily at 2:00 AM
const schedule = '0 2 * * *';

// Examples:
// Daily at 6:00 AM: '0 6 * * *'
// Every 6 hours: '0 */6 * * *'
// Weekly on Sunday at 3:00 AM: '0 3 * * 0'
```

Restart backend after changes.

### Change Backup Retention

By default, backups are kept indefinitely. To add automatic deletion:

Add this to `/backend/src/jobs/backup.job.js`:

```javascript
// Keep backups for 30 days
const MAX_BACKUP_AGE_DAYS = 30;

function deleteOldBackups() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_BACKUP_AGE_DAYS);
  // Delete backup folders older than cutoffDate
}
```

---

## File Format Reference

### Excel Import Format (82 Columns)

**Required Columns**:
- Name & Sur Name
- Age
- Sex

**Optional Columns** (79 more):
- Reg No, Reg. Date
- Height, Weight, Blood Group
- History, Family History of Cancer
- Smoking, Pan, Gutka, Naswar, Alcohol (with Quantity columns)
- Type of Cancer, Stage, Grade, WHO
- Previous Chemo, Previous RT, Previous Surgery, etc.
- Pathology details (Tumor Size, Nodes, Margins, etc.)
- Biomarkers (ER, PR, Her2-U, Ki-67)
- Imaging studies (CT, MRI, PET, etc.)
- Treatment plan details

See `/backend/src/utils/excel.mapper.js` for complete column mapping.

### Excel Export Format

Same 82-column structure as import format. Export includes all patients with complete related data flattened into single rows.

---

## API Reference

### GET /api/export/patients
Export all patients to Excel file.

**Response**: Binary Excel file (.xlsx)

### GET /api/backup/status
Get current backup system status.

**Response**: JSON with last backup info, next scheduled time, total backups

### POST /api/backup/create
Trigger manual backup immediately.

**Response**: JSON with job ID and status

### GET /api/backup/list
List all available backups.

**Response**: JSON array of backup information

See `/specs/002-excel-data-ops/contracts/api.yaml` for complete API specification.

---

## Support

For issues or questions:
1. Check `/data/logs/` for import/export logs
2. Check server console for backup errors
3. Review this quickstart guide
4. See `/specs/002-excel-data-ops/spec.md` for detailed requirements
