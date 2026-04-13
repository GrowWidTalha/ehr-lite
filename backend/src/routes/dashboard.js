/**
 * Dashboard Routes
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
    // Get total patients
    const totalPatients = await safeQuery(`
      SELECT COUNT(*) as count
      FROM patients
    `);

    // Get active diagnoses (count unique patients with at least one diagnosis)
    // Use safeQuery in case table doesn't exist
    const activeDiagnoses = await safeQuery(`
      SELECT COUNT(DISTINCT patient_id) as count
      FROM cancer_diagnoses
    `);

    // Get total reports
    const totalReports = await safeQuery(`
      SELECT COUNT(*) as count
      FROM reports
    `);

    // Get new patients this month
    const newThisMonth = await safeQuery(`
      SELECT COUNT(*) as count
      FROM patients
      WHERE strftime('%Y-%m', registration_date) = strftime('%Y-%m', 'now')
    `);

    res.json({
      total_patients: totalPatients,
      active_diagnoses: activeDiagnoses,
      total_reports: totalReports,
      new_this_month: newThisMonth,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
