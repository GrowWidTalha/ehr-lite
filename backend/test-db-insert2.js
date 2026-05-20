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

    // Test without spreading the array
    console.log('Testing INSERT with spread operator:');
    const params = [reportId, patientId, finalTitle, report_type, notes, report_date, now];
    console.log('Params:', params);
    console.log('First param type:', typeof params[1]);

    const result = await run(
      `INSERT INTO reports (id, patient_id, title, report_type, notes, report_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ...params  // Spread the array
    );

    console.log('Insert result:', result);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testInsert();
