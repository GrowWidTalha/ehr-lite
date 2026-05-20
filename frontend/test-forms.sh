#!/bin/bash

# Frontend Forms API Test Suite
# Tests all form submissions to backend API

BASE_URL="http://localhost:4000"
RESULTS=()

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Test helper function
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="${5:-200}"

    test_count=$((test_count + 1))
    echo -e "\n${YELLOW}Test $test_count: $test_name${NC}"
    echo "Endpoint: $method $endpoint"
    echo "Data: $data"
    echo "Expected Status: $expected_code"

    response=$(curl -s -w "\n%{http_code}" -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL$endpoint")

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    echo "Status Code: $status_code"
    echo "Response: $body"

    if [ "$status_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        pass_count=$((pass_count + 1))
        RESULTS+=("PASS: $test_name")
    else
        echo -e "${RED}✗ FAIL${NC}"
        fail_count=$((fail_count + 1))
        RESULTS+=("FAIL: $test_name (Expected $expected_code, got $status_code)")
    fi
}

echo "=========================================="
echo "Frontend Forms API Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# ============================================================================
# 1. CREATE PATIENT TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "1. CREATE PATIENT (POST /api/patients)"
echo -e "${YELLOW}========================================${NC}"

# Test 1.1: Create patient with required fields only
test_api "Create Patient - Required Only" \
    "POST" \
    "/api/patients" \
    '{"PatientName": "Test Patient 1"}' \
    201

# Extract patient ID from last response
patient_id_1=$(echo "$body" | grep -o '"PatientID":[0-9]*' | head -1 | grep -o '[0-9]*' | head -1)
echo "Created Patient ID: $patient_id_1"

# Test 1.2: Create patient with all fields
test_api "Create Patient - All Fields" \
    "POST" \
    "/api/patients" \
    '{
        "PatientName": "Test Patient Full",
        "Age": 45,
        "Gender": "Male",
        "ContactNo": "1234567890",
        "CNICNo": "12345-1234567-1",
        "RegistrationNo": "REG-TEST-001",
        "RegistrationDate": "2026-05-19",
        "MaritalStatus": "Married"
    }' \
    201

patient_id_2=$(echo "$body" | grep -o '"PatientID":[0-9]*' | head -1 | grep -o '[0-9]*' | tail -1)
echo "Created Patient ID: $patient_id_2"

# Test 1.3: Validation error - missing required field
test_api "Create Patient - Missing Required Field" \
    "POST" \
    "/api/patients" \
    '{"Age": 45}' \
    400

# ============================================================================
# 2. UPDATE VITALS TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "2. UPDATE VITALS (PUT /api/patients/:id)"
echo -e "${YELLOW}========================================${NC}"

# Test 2.1: Update all vitals
test_api "Update Vitals - All Fields" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "height_cm": 175,
        "weight_kg": 70,
        "blood_pressure_systolic": 120,
        "blood_pressure_diastolic": 80,
        "blood_group": "A+"
    }' \
    200

# Test 2.2: Update partial vitals
test_api "Update Vitals - Partial Fields" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "weight_kg": 72,
        "blood_group": "B+"
    }' \
    200

# Test 2.3: Verify vitals were persisted
echo -e "\n${YELLOW}Test: Verify Vitals Persistence${NC}"
verify_response=$(curl -s "$BASE_URL/api/patients/$patient_id_1")
echo "Response: $verify_response"
if echo "$verify_response" | grep -q "72"; then
    echo -e "${GREEN}✓ PASS - Vitals persisted correctly${NC}"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ FAIL - Vitals not persisted${NC}"
    fail_count=$((fail_count + 1))
fi

# ============================================================================
# 3. UPDATE HISTORY TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "3. UPDATE HISTORY (PUT /api/patients/:id)"
echo -e "${YELLOW}========================================${NC}"

# Test 3.1: Update presenting complaint
test_api "Update History - Presenting Complaint" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "PresentingComplaint": "Patient presents with persistent cough and weight loss"
    }' \
    200

# Test 3.2: Update comorbidities
test_api "Update History - Comorbidities" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "Comorbidities": "Diabetes Type 2, Hypertension"
    }' \
    200

# Test 3.3: Update family cancer history
test_api "Update History - Family Cancer History" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "FamilyCancerHistory": "Mother - Breast Cancer (age 55), Father - Lung Cancer (age 65)"
    }' \
    200

# Test 3.4: Update all history fields
test_api "Update History - All Fields" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "PresentingComplaint": "Breast lump discovered during self-examination",
        "Comorbidities": "None",
        "FamilyCancerHistory": "Sister - Ovarian Cancer"
    }' \
    200

# ============================================================================
# 4. UPDATE HABITS TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "4. UPDATE HABITS (PUT /api/patients/:id)"
echo -e "${YELLOW}========================================${NC}"

# Test 4.1: Current smoker
test_api "Update Habits - Current Smoker" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "smoking_status": "current",
        "smoking_quantity": 10
    }' \
    200

# Test 4.2: Pan use
test_api "Update Habits - Pan Use" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "pan_use": "current",
        "pan_quantity": 5
    }' \
    200

# Test 4.3: Gutka use
test_api "Update Habits - Gutka Use" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "gutka_use": "current",
        "gutka_quantity": 3
    }' \
    200

# Test 4.4: Naswar use
test_api "Update Habits - Naswar Use" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "naswar_use": "former",
        "naswar_quantity": 2,
        "quit_period": "2 years"
    }' \
    200

# Test 4.5: Alcohol use
test_api "Update Habits - Alcohol Use" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "alcohol_use": "occasional",
        "alcohol_quantity": 2
    }' \
    200

# Test 4.6: Multiple habits
test_api "Update Habits - Multiple Habits" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "smoking_status": "former",
        "smoking_quantity": 15,
        "quit_period": "5 years",
        "other_habits": "Betel nut chewing"
    }' \
    200

# Test 4.7: Never smoked
test_api "Update Habits - Never Smoked" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "smoking_status": "never"
    }' \
    200

# ============================================================================
# 5. CREATE DIAGNOSIS TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "5. CREATE DIAGNOSIS (PUT /api/patients/:id with diagnosis data)"
echo -e "${YELLOW}========================================${NC}"

# Test 5.1: Lung cancer diagnosis
test_api "Create Diagnosis - Lung Cancer" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "cancer_type": "lungs",
        "stAge": "III",
        "grade": 2,
        "tumor_size": "4.5 cm",
        "depth": "2.1 cm",
        "margins": "Positive",
        "lvi": "Yes",
        "pni": "No",
        "nodes_recovered": 15,
        "nodes_involved": 4
    }' \
    200

# Test 5.2: Breast cancer diagnosis with receptor status
test_api "Create Diagnosis - Breast Cancer with Receptors" \
    "PUT" \
    "/api/patients/$patient_id_2" \
    '{
        "cancer_type": "breast",
        "stAge": "II",
        "grade": 3,
        "tumor_size": "2.3 cm",
        "depth": "1.5 cm",
        "margins": "Clear",
        "lvi": "No",
        "pni": "No",
        "nodes_recovered": 20,
        "nodes_involved": 2,
        "er_status": "Positive",
        "pr_status": "Positive",
        "her2_status": "Negative",
        "ki67_percentage": 15
    }' \
    200

# Test 5.3: Brain cancer diagnosis
test_api "Create Diagnosis - Brain Cancer" \
    "PUT" \
    "/api/patients/$patient_id_1" \
    '{
        "cancer_type": "brain",
        "stAge": "IV",
        "grade": 4,
        "tumor_size": "3.8 cm"
    }' \
    200

# ============================================================================
# 6. CREATE REPORT TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "6. CREATE REPORT (POST /api/patients/:id/reports)"
echo -e "${YELLOW}========================================${NC}"

# Test 6.1: Create report with required fields only
test_api "Create Report - Required Only" \
    "POST" \
    "/api/patients/$patient_id_1/reports" \
    '{
        "report_type": "CT Scan"
    }' \
    201

# Test 6.2: Create report with all fields
test_api "Create Report - All Fields" \
    "POST" \
    "/api/patients/$patient_id_1/reports" \
    '{
        "report_type": "MRI",
        "title": "Brain MRI with Contrast",
        "notes": "Enhancing mass lesion in right frontal lobe",
        "report_date": "2026-05-15"
    }' \
    201

# Test 6.3: Validation error - missing report_type
test_api "Create Report - Missing Required Field" \
    "POST" \
    "/api/patients/$patient_id_1/reports" \
    '{
        "title": "Test Report"
    }' \
    400

# Test 6.4: Create multiple reports for patient
test_api "Create Report - Multiple Reports" \
    "POST" \
    "/api/patients/$patient_id_2/reports" \
    '{
        "report_type": "Blood Test",
        "title": "Complete Blood Count",
        "notes": "Hemoglobin: 12.5 g/dL, WBC: 7,500/μL",
        "report_date": "2026-05-18"
    }' \
    201

# ============================================================================
# 7. EDGE CASE TESTS
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "7. EDGE CASE TESTS"
echo -e "${YELLOW}========================================${NC}"

# Test 7.1: Update non-existent patient
test_api "Update Non-existent Patient" \
    "PUT" \
    "/api/patients/99999" \
    '{
        "Age": 50
    }' \
    404

# Test 7.2: Create report for non-existent patient
test_api "Create Report - Non-existent Patient" \
    "POST" \
    "/api/patients/99999/reports" \
    '{
        "report_type": "Test"
    }' \
    404

# Test 7.3: Invalid patient ID format
test_api "Get Patient - Invalid ID Format" \
    "GET" \
    "/api/patients/invalid" \
    "" \
    400

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo "TEST SUMMARY"
echo -e "${YELLOW}========================================${NC}"
echo "Total Tests: $test_count"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Failed Tests:"
    for result in "${RESULTS[@]}"; do
        if [[ $result == FAIL* ]]; then
            echo "  - $result"
        fi
    done
    exit 1
fi
