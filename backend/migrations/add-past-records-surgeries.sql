-- Migration: Add Past Records and Past Surgeries tables
-- Version: 2.1.0
-- Date: 2024-12-20

-- Past Records Table
CREATE TABLE IF NOT EXISTS PastRecords (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER NOT NULL REFERENCES Patient(PatientID) ON DELETE CASCADE,
    PreviousChemo TEXT,
    PreviousRT TEXT,
    PreviousTargeted TEXT,
    PreviousHT TEXT,
    PreviousIT TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Past Surgeries Table
CREATE TABLE IF NOT EXISTS PastSurgeries (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER NOT NULL REFERENCES Patient(PatientID) ON DELETE CASCADE,
    SurgeryDate DATETIME,
    Description TEXT NOT NULL,
    IsCancerSurgery INTEGER DEFAULT 0,
    ImagePath TEXT,
    Notes TEXT,
    HospitalName TEXT,
    SurgeonName TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pastrecords_patient ON PastRecords(PatientID);
CREATE INDEX IF NOT EXISTS idx_pastsurgeries_patient ON PastSurgeries(PatientID);
CREATE INDEX IF NOT EXISTS idx_pastsurgeries_cancer ON PastSurgeries(IsCancerSurgery);
