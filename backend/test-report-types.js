// Test script to verify ReportTypes table
import { all } from './src/db/query.js';

async function testReportTypes() {
  try {
    const reportTypes = await all('SELECT TypeCode, TypeName, Category FROM ReportTypes WHERE Category IN ("Imaging", "Pathology", "Lab") ORDER BY DisplayOrder');

    console.log('Report Types:');
    console.log('Code'.padEnd(15), 'Name'.padEnd(25), 'Category');
    console.log('-'.repeat(60));

    for (const type of reportTypes) {
      console.log(
        type.TypeCode.padEnd(15),
        type.TypeName.padEnd(25),
        type.Category
      );
    }

    console.log(`\nTotal: ${reportTypes.length} report types found`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testReportTypes();
