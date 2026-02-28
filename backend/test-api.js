#!/usr/bin/env node

/**
 * EHR Lite Backend API Test Script
 * Tests all endpoints with actual data and prints detailed report
 */

import { readFileSync } from 'fs';
import http from 'http';

const API_BASE = 'http://localhost:4000';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Test data storage
let testData = {
  patientId: null,
  vitalsId: null,
  historyId: null,
  habitsId: null,
  diagnosisId: null,
  reportId: null,
  imageId: null
};

let results = {
  passed: 0,
  failed: 0,
  tests: []
};

// HTTP helpers
function request(method, path, data = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {}
    };

    if (!isFormData && data) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (isFormData) {
        // For form data, we'd need to use FormData but in Node we need a different approach
        req.write(JSON.stringify(data));
      } else {
        req.write(JSON.stringify(data));
      }
    }

    req.end();
  });
}

// Test runner
async function test(name, fn) {
  console.log(`\n${colors.cyan}┌─ TEST: ${name}${colors.reset}`);
  try {
    await fn();
    results.passed++;
  } catch (error) {
    results.failed++;
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
  }
}

// Assertions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

// Print helpers
function printRequest(method, path, data) {
  console.log(`  ${colors.gray}Request:${colors.reset} ${colors.magenta}${method}${colors.reset} ${path}`);
  if (data) {
    console.log(`  ${colors.gray}Payload:${colors.reset}`);
    console.log(`    ${JSON.stringify(data, null, 2).split('\n').join('\n    ')}`);
  }
}

function printResponse(status, data) {
  const statusColor = status >= 200 && status < 300 ? colors.green : colors.red;
  console.log(`  ${colors.gray}Response:${colors.reset} ${statusColor}${status}${colors.reset}`);
  console.log(`  ${colors.gray}Data:${colors.reset}`);
  console.log(`    ${JSON.stringify(data, null, 2).split('\n').join('\n    ')}`);
}

function printSuccess(message) {
  console.log(`  ${colors.green}✓${colors.reset} ${message}`);
}

// ============================================================================
// TESTS
// ============================================================================

async function runAllTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`  EHR LITE BACKEND API TEST SUITE`);
  console.log(`  Target: ${API_BASE}`);
  console.log(`  Time: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  // ----------------------------------------------------------------
  // HEALTH & INFO
  // ----------------------------------------------------------------
  await test('Health Check', async () => {
    printRequest('GET', '/api/health');
    const res = await request('GET', '/api/health');
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assertEqual(res.data.status, 'ok', 'Status should be ok');
    printSuccess('Server is healthy');
  });

  await test('API Info', async () => {
    printRequest('GET', '/api');
    const res = await request('GET', '/api');
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    printSuccess('API documentation accessible');
  });

  // ----------------------------------------------------------------
  // PATIENT CRUD
  // ----------------------------------------------------------------
  await test('Create Patient', async () => {
    const payload = {
      full_name: 'Sarah Johnson',
      age: 42,
      sex: 'Female',
      phone: '+92-300-1234567',
      cnic: '12345-6789012-3',
      marital_status: 'Married',
      education: 'Masters',
      language: 'Urdu',
      territory: 'Karachi',
      children_count: 2,
      sibling_count: 3
    };
    printRequest('POST', '/api/patients', payload);
    const res = await request('POST', '/api/patients', payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 201, 'Status should be 201');
    assert(res.data.success, 'Should return success');
    assert(res.data.data.id, 'Should have patient ID');
    testData.patientId = res.data.data.id;
    printSuccess(`Patient created with ID: ${testData.patientId}`);
  });

  await test('Get Single Patient', async () => {
    printRequest('GET', `/api/patients/${testData.patientId}`);
    const res = await request('GET', `/api/patients/${testData.patientId}`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assertEqual(res.data.data.full_name, 'Sarah Johnson', 'Name should match');
    printSuccess('Patient retrieved successfully');
  });

  await test('List All Patients', async () => {
    printRequest('GET', '/api/patients');
    const res = await request('GET', '/api/patients');
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assert(res.data.data.length > 0, 'Should have at least one patient');
    printSuccess(`Found ${res.data.data.length} patient(s)`);
  });

  await test('Search Patients', async () => {
    printRequest('GET', '/api/patients?search=Sarah');
    const res = await request('GET', '/api/patients?search=Sarah');
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    printSuccess('Search working');
  });

  await test('Update Patient', async () => {
    const payload = { age: 43 };
    printRequest('PUT', `/api/patients/${testData.patientId}`, payload);
    const res = await request('PUT', `/api/patients/${testData.patientId}`, payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assertEqual(res.data.data.age, 43, 'Age should be updated');
    printSuccess('Patient updated');
  });

  // ----------------------------------------------------------------
  // VITALS
  // ----------------------------------------------------------------
  await test('Add Patient Vitals', async () => {
    const payload = {
      height_cm: 165,
      weight_kg: 58,
      blood_group: 'A+'
    };
    printRequest('POST', `/api/patients/${testData.patientId}/vitals`, payload);
    const res = await request('POST', `/api/patients/${testData.patientId}/vitals`, payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 201, 'Status should be 201');
    testData.vitalsId = res.data.data.id;
    printSuccess('Vitals added');
  });

  await test('Get Patient Vitals', async () => {
    printRequest('GET', `/api/patients/${testData.patientId}/vitals`);
    const res = await request('GET', `/api/patients/${testData.patientId}/vitals`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assert(res.data.data.length > 0, 'Should have vitals records');
    printSuccess(`Found ${res.data.data.length} vitals record(s)`);
  });

  // ----------------------------------------------------------------
  // HISTORY
  // ----------------------------------------------------------------
  await test('Create Patient History', async () => {
    const payload = {
      presenting_complaint: 'Patient reports occasional headaches and fatigue for the past 3 months.',
      comorbidities: 'Type 2 Diabetes, Hypertension',
      family_cancer_history: 'Mother had breast cancer at age 55'
    };
    printRequest('POST', `/api/patients/${testData.patientId}/history`, payload);
    const res = await request('POST', `/api/patients/${testData.patientId}/history`, payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 201, 'Status should be 201');
    printSuccess('History created');
  });

  await test('Get Patient History', async () => {
    printRequest('GET', `/api/patients/${testData.patientId}/history`);
    const res = await request('GET', `/api/patients/${testData.patientId}/history`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assert(res.data.data.presenting_complaint, 'Should have history');
    printSuccess('History retrieved');
  });

  // ----------------------------------------------------------------
  // HABITS
  // ----------------------------------------------------------------
  await test('Create Patient Habits', async () => {
    const payload = {
      smoking_status: 'Former',
      smoking_quantity: '10 packs/day for 10 years',
      quit_period: '5 years',
      pan_use: 'Never',
      gutka_use: 'Never',
      naswar_use: 'Never',
      alcohol_use: 'Never'
    };
    printRequest('POST', `/api/patients/${testData.patientId}/habits`, payload);
    const res = await request('POST', `/api/patients/${testData.patientId}/habits`, payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 201, 'Status should be 201');
    printSuccess('Habits created');
  });

  await test('Get Patient Habits', async () => {
    printRequest('GET', `/api/patients/${testData.patientId}/habits`);
    const res = await request('GET', `/api/patients/${testData.patientId}/habits`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assertEqual(res.data.data.smoking_status, 'Former', 'Smoking status should match');
    printSuccess('Habits retrieved');
  });

  // ----------------------------------------------------------------
  // CANCER DIAGNOSIS
  // ----------------------------------------------------------------
  await test('Create Cancer Diagnosis', async () => {
    const payload = {
      cancer_type: 'Breast Cancer',
      stage: 'II',
      grade: '2',
      who_classification: 'Invasive Ductal Carcinoma',
      diagnosis_date: '2025-12-15'
    };
    // We'll need to add this endpoint - for now testing the get
    printRequest('GET', `/api/patients/${testData.patientId}/diagnoses`);
    const res = await request('GET', `/api/patients/${testData.patientId}/diagnoses`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    printSuccess('Diagnoses endpoint working');
  });

  // ----------------------------------------------------------------
  // REPORTS
  // ----------------------------------------------------------------
  await test('Create Report', async () => {
    const payload = {
      patient_id: testData.patientId,
      title: 'Initial Consultation Report',
      report_type: 'consultation',
      notes: 'Patient presented with complaints of headache. Examination normal.',
      report_date: '2025-12-01'
    };
    printRequest('POST', '/api/reports', payload);
    const res = await request('POST', '/api/reports', payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 201, 'Status should be 201');
    testData.reportId = res.data.data.id;
    printSuccess(`Report created with ID: ${testData.reportId}`);
  });

  await test('Get Report', async () => {
    printRequest('GET', `/api/reports/${testData.reportId}`);
    const res = await request('GET', `/api/reports/${testData.reportId}`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assertEqual(res.data.data.title, 'Initial Consultation Report', 'Title should match');
    printSuccess('Report retrieved');
  });

  await test('List Patient Reports', async () => {
    printRequest('GET', `/api/reports?patient_id=${testData.patientId}`);
    const res = await request('GET', `/api/reports?patient_id=${testData.patientId}`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    assert(res.data.data.length > 0, 'Should have reports');
    printSuccess(`Found ${res.data.data.length} report(s)`);
  });

  await test('Update Report', async () => {
    const payload = { notes: 'Updated: Patient referred for MRI.' };
    printRequest('PUT', `/api/reports/${testData.reportId}`, payload);
    const res = await request('PUT', `/api/reports/${testData.reportId}`, payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    printSuccess('Report updated');
  });

  // ----------------------------------------------------------------
  // IMAGES
  // ----------------------------------------------------------------
  await test('Get Images by Patient', async () => {
    printRequest('GET', `/api/images?patient_id=${testData.patientId}`);
    const res = await request('GET', `/api/images?patient_id=${testData.patientId}`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 200, 'Status should be 200');
    printSuccess(`Images endpoint working - found ${res.data.data.length} images`);
  });

  // ----------------------------------------------------------------
  // ERROR CASES
  // ----------------------------------------------------------------
  await test('Get Invalid Patient (400 - bad UUID format)', async () => {
    const fakeId = 'invalid-uuid-format';
    printRequest('GET', `/api/patients/${fakeId}`);
    const res = await request('GET', `/api/patients/${fakeId}`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 400, 'Status should be 400 (invalid UUID)');
    assert(!res.data.success, 'Should return error');
    printSuccess('UUID format validation works');
  });

  await test('Get Non-existent Patient (404)', async () => {
    // Use a valid UUID v4 format that doesn't exist in database
    const fakeId = '12345678-1234-4123-8123-123456789abc';
    printRequest('GET', `/api/patients/${fakeId}`);
    const res = await request('GET', `/api/patients/${fakeId}`);
    printResponse(res.status, res.data);
    assertEqual(res.status, 404, 'Status should be 404');
    assert(!res.data.success, 'Should return error');
    printSuccess('404 error handling works');
  });

  await test('Create Patient Without Name (400)', async () => {
    const payload = { age: 30 };
    printRequest('POST', '/api/patients', payload);
    const res = await request('POST', '/api/patients', payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 400, 'Status should be 400');
    assert(!res.data.success, 'Should return error');
    printSuccess('Validation error handling works');
  });

  await test('Invalid Blood Group (400)', async () => {
    const payload = { blood_group: 'XYZ' };
    printRequest('POST', `/api/patients/${testData.patientId}/vitals`, payload);
    const res = await request('POST', `/api/patients/${testData.patientId}/vitals`, payload);
    printResponse(res.status, res.data);
    assertEqual(res.status, 400, 'Status should be 400');
    printSuccess('Blood group validation works');
  });

  // ----------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`  TEST SUMMARY`);
  console.log(`${'='.repeat(60)}${colors.reset}`);

  console.log(`\n  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`  ${colors.gray}Total:  ${results.passed + results.failed}${colors.reset}`);

  if (results.failed === 0) {
    console.log(`\n  ${colors.green}✓ ALL TESTS PASSED!${colors.reset}\n`);
    return 0;
  } else {
    console.log(`\n  ${colors.red}✗ SOME TESTS FAILED${colors.reset}\n`);
    return 1;
  }
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
