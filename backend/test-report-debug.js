import { generateId } from './src/utils/uuid.js';

// Simulate the issue
const id = '16';
const patientId = Number(id);

console.log('Original id:', id, typeof id);
console.log('Converted patientId:', patientId, typeof patientId);
console.log('isNaN check:', isNaN(patientId));

const reportId = generateId();
const finalTitle = 'Test Report';
const report_type = 'CT Scan';
const notes = null;
const report_date = null;
const now = new Date().toISOString();

console.log('\nGenerated reportId:', reportId);
console.log('\nQuery parameters:', [reportId, patientId, finalTitle, report_type, notes, report_date, now]);
