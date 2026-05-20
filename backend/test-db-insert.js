import { run, get } from './src/db/query.js';
import { generateId } from './src/utils/uuid.js';

async function testInsert() {
  try {
    const reportId = generateId();
    const patientId = 16;
    const finalTitle = 'Test Report';
    const report_type = 'CT Scan';
    const notes = null;
    const report_date = null;
    const now = new Date().toISOString();

    console.log('Testing INSERT with params:');
    console.log([reportId, patientId, finalTitle, report_type, notes, report_date, now]);

    const result = await run(
      `INSERT INTO reports (id, patient_id, title, report_type, notes, report_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reportId, patientId, finalTitle, report_type, notes, report_date, now]
    );

    console.log('Insert result:', result);

    const report = await get('SELECT * FROM reports WHERE id = ?', reportId);
    console.log('Retrieved report:', report);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testInsert();
