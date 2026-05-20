/**
 * Dashboard Routes - New Schema (PascalCase/Integer)
 * API endpoints for dashboard statistics and metrics
 */

import express from 'express';
import { all, get } from '../db/query.js';

const router = express.Router();

/**
 * Helper function to safely query a table
 */
async function safeQuery(query, defaultValue = 0) {
  try {
    const [result] = await all(query);
    return result?.count || 0;
  } catch (error) {
    // Table might not exist, return default value
    return defaultValue;
  }
}

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total patients from Patient table
    const totalPatients = await safeQuery(`
      SELECT COUNT(*) as count
      FROM Patient
    `);

    // Get today's registrations
    const todayRegistrations = await safeQuery(`
      SELECT COUNT(*) as count
      FROM Patient
      WHERE date(RegistrationDate) = date('now')
    `);

    // Get follow-up patients
    const followUpPatients = await safeQuery(`
      SELECT COUNT(*) as count
      FROM Patient
      WHERE FollowUp = 1
    `);

    // Get active diagnoses (patients with any cancer type filled)
    const activeDiagnoses = await safeQuery(`
      SELECT COUNT(*) as count
      FROM Patient
      WHERE BrainTumor IS NOT NULL AND BrainTumor != ''
         OR HeadAndNeck IS NOT NULL AND HeadAndNeck != ''
         OR BreastCancer IS NOT NULL AND BreastCancer != ''
         OR Genitourinary IS NOT NULL AND Genitourinary != ''
         OR Gyneacological IS NOT NULL AND Gyneacological != ''
         OR LungsCancer IS NOT NULL AND LungsCancer != ''
         OR GITumor IS NOT NULL AND GITumor != ''
         OR SkinTumor IS NOT NULL AND SkinTumor != ''
         OR Hematological IS NOT NULL AND Hematological != ''
         OR Sarcoma IS NOT NULL AND Sarcoma != ''
         OR Carcinoma IS NOT NULL AND Carcinoma != ''
    `);

    // Get total reports count
    const totalReports = await safeQuery(`
      SELECT COUNT(*) as count
      FROM reports
    `);

    // Get cancer type breakdown
    const cancerTypeBreakdown = {
      brainTumor: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE BrainTumor IS NOT NULL AND BrainTumor != ''`),
      headAndNeck: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE HeadAndNeck IS NOT NULL AND HeadAndNeck != ''`),
      breastCancer: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE BreastCancer IS NOT NULL AND BreastCancer != ''`),
      genitourinary: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE Genitourinary IS NOT NULL AND Genitourinary != ''`),
      gynecological: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE Gyneacological IS NOT NULL AND Gyneacological != ''`),
      lungsCancer: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE LungsCancer IS NOT NULL AND LungsCancer != ''`),
      giTumor: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE GITumor IS NOT NULL AND GITumor != ''`),
      skinTumor: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE SkinTumor IS NOT NULL AND SkinTumor != ''`),
      hematological: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE Hematological IS NOT NULL AND Hematological != ''`),
      sarcoma: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE Sarcoma IS NOT NULL AND Sarcoma != ''`),
      carcinoma: await safeQuery(`SELECT COUNT(*) as count FROM Patient WHERE Carcinoma IS NOT NULL AND Carcinoma != ''`)
    };

    res.json({
      success: true,
      data: {
        totalPatients,
        todayRegistrations,
        followUpPatients,
        activeDiagnoses,
        totalReports,
        cancerTypeBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
  }
});

/**
 * GET /api/dashboard/recent
 * Get recent patients (last 5)
 */
router.get('/recent', async (req, res) => {
  try {
    const recentPatients = await all(`
      SELECT *
      FROM vw_patient_list
      ORDER BY RegistrationDate DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: recentPatients
    });
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent patients' });
  }
});

export default router;
