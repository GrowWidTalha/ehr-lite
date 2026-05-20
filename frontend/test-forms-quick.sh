#!/bin/bash

BASE_URL="http://localhost:4000"
pass=0
fail=0

echo "=========================================="
echo "Frontend Forms API Test - Quick Results"
echo "=========================================="

# Test counter
test_num=0

# Test function
test() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected="$5"

    test_num=$((test_num + 1))

    response=$(curl -s -w "%{http_code}" -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL$endpoint")

    status=${response: -3}
    body=${response%???}

    if [ "$status" = "$expected" ]; then
        echo "✓ Test $test_num: $name ($status)"
        pass=$((pass + 1))
        return 0
    else
        echo "✗ Test $test_num: $name (Expected: $expected, Got: $status)"
        fail=$((fail + 1))
        return 1
    fi
}

# Create test patient first
patient1=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"PatientName":"Test Patient 1"}' \
    "$BASE_URL/api/patients" | grep -o '"PatientID":[0-9]*' | grep -o '[0-9]*' | head -1)

patient2=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"PatientName":"Test Patient 2","Age":40,"Gender":"Female"}' \
    "$BASE_URL/api/patients" | grep -o '"PatientID":[0-9]*' | grep -o '[0-9]*' | head -1)

echo "Created test patients: $patient1, $patient2"
echo ""

# 1. CREATE PATIENT
test "Create Patient - Required Only" "POST" "/api/patients" '{"PatientName":"John Doe"}' "201"
test "Create Patient - With All Fields" "POST" "/api/patients" '{"PatientName":"Jane Doe","Age":35,"Gender":"Female","ContactNo":"1234567890","RegistrationNo":"TEST-001"}' "201"
test "Create Patient - Missing Required" "POST" "/api/patients" '{"Age":45}' "400"

# 2. UPDATE VITALS
test "Update Vitals - Height/Weight" "PUT" "/api/patients/$patient1" '{"height_cm":170,"weight_kg":65}' "200"
test "Update Vitals - Blood Pressure" "PUT" "/api/patients/$patient1" '{"blood_pressure_systolic":120,"blood_pressure_diastolic":80}' "200"
test "Update Vitals - Blood Group" "PUT" "/api/patients/$patient1" '{"blood_group":"A+"}' "200"

# 3. UPDATE HISTORY
test "Update History - Presenting Complaint" "PUT" "/api/patients/$patient1" '{"PresentingComplaint":"Persistent cough"}' "200"
test "Update History - Comorbidities" "PUT" "/api/patients/$patient1" '{"Comorbidities":"Diabetes, Hypertension"}' "200"
test "Update History - Family Cancer" "PUT" "/api/patients/$patient1" '{"FamilyCancerHistory":"Mother - Breast Cancer"}' "200"

# 4. UPDATE HABITS
test "Update Habits - Current Smoker" "PUT" "/api/patients/$patient1" '{"smoking_status":"current","smoking_quantity":10}' "200"
test "Update Habits - Pan Use" "PUT" "/api/patients/$patient2" '{"pan_use":"current","pan_quantity":3}' "200"
test "Update Habits - Gutka Use" "PUT" "/api/patients/$patient2" '{"gutka_use":"current","gutka_quantity":2}' "200"
test "Update Habits - Naswar Use" "PUT" "/api/patients/$patient2" '{"naswar_use":"former","naswar_quantity":1,"quit_period":"2 years"}' "200"
test "Update Habits - Alcohol Use" "PUT" "/api/patients/$patient1" '{"alcohol_use":"occasional","alcohol_quantity":2}' "200"
test "Update Habits - Never Smoked" "PUT" "/api/patients/$patient2" '{"smoking_status":"never"}' "200"

# 5. CREATE DIAGNOSIS
test "Create Diagnosis - Lung Cancer" "PUT" "/api/patients/$patient1" '{"cancer_type":"lungs","stAge":"III","grade":2,"tumor_size":"4.5 cm","depth":"2.1 cm","margins":"Positive","lvi":"Yes","pni":"No","nodes_recovered":15,"nodes_involved":4}' "200"
test "Create Diagnosis - Breast Cancer" "PUT" "/api/patients/$patient2" '{"cancer_type":"breast","stAge":"II","grade":3,"er_status":"Positive","pr_status":"Positive","her2_status":"Negative","ki67_percentage":15}' "200"
test "Create Diagnosis - Brain Cancer" "PUT" "/api/patients/$patient1" '{"cancer_type":"brain","stAge":"IV","grade":4,"tumor_size":"3.8 cm"}' "200"

# 6. CREATE REPORT
test "Create Report - Required Only" "POST" "/api/patients/$patient1/reports" '{"report_type":"CT Scan"}' "201"
test "Create Report - All Fields" "POST" "/api/patients/$patient1/reports" '{"report_type":"MRI","title":"Brain MRI","notes":"Enhancing mass lesion","report_date":"2026-05-15"}' "201"
test "Create Report - Missing Required" "POST" "/api/patients/$patient1/reports" '{"title":"Test"}' "400"
test "Create Report - Multiple Reports" "POST" "/api/patients/$patient2/reports" '{"report_type":"Blood Test","title":"CBC","notes":"Hemoglobin: 12.5","report_date":"2026-05-18"}' "201"

# 7. EDGE CASES
test "Update - Non-existent Patient" "PUT" "/api/patients/99999" '{"Age":50}' "404"
test "Report - Non-existent Patient" "POST" "/api/patients/99999/reports" '{"report_type":"Test"}' "404"

# 8. DATA PERSISTENCE VERIFICATION
echo ""
echo "=== Data Persistence Verification ==="

# Verify vitals persisted
verify_data=$(curl -s "$BASE_URL/api/patients/$patient1")
if echo "$verify_data" | grep -q "170"; then
    echo "✓ Vitals persisted correctly"
    pass=$((pass + 1))
else
    echo "✗ Vitals not persisted"
    fail=$((fail + 1))
fi

# Verify history persisted
if echo "$verify_data" | grep -q "Persistent cough"; then
    echo "✓ History persisted correctly"
    pass=$((pass + 1))
else
    echo "✗ History not persisted"
    fail=$((fail + 1))
fi

# Verify diagnosis persisted
if echo "$verify_data" | grep -q "lungs"; then
    echo "✓ Diagnosis persisted correctly"
    pass=$((pass + 1))
else
    echo "✗ Diagnosis not persisted"
    fail=$((fail + 1))
fi

# Verify reports created
report_count=$(curl -s "$BASE_URL/api/patients/$patient1/reports" | grep -o '"id"' | wc -l)
if [ "$report_count" -gt 0 ]; then
    echo "✓ Reports created successfully ($report_count reports)"
    pass=$((pass + 1))
else
    echo "✗ Reports not created"
    fail=$((fail + 1))
fi

echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo "Total Tests: $((pass + fail))"
echo "Passed: $pass"
echo "Failed: $fail"
echo ""

if [ $fail -eq 0 ]; then
    echo "✓ ALL TESTS PASSED"
    exit 0
else
    echo "✗ $fail TESTS FAILED"
    exit 1
fi
