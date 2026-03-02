/**
 * Dashboard Routes
 * API endpoints for dashboard statistics and metrics
 */

import express from 'express';
import { all, get } from '../db/query.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total patients
    const [totalPatientsResult] = await all(`
      SELECT COUNT(*) as count
      FROM patients
    `);
    const totalPatients = totalPatientsResult?.count || 0;

    // Get active diagnoses (count unique patients with at least one diagnosis)
    const [activeDiagnosesResult] = await all(`
      SELECT COUNT(DISTINCT patient_id) as count
      FROM diagnoses
    `);
    const activeDiagnoses = activeDiagnosesResult?.count || 0;

    // Get total reports
    const [totalReportsResult] = await all(`
      SELECT COUNT(*) as count
      FROM reports
    `);
    const totalReports = totalReportsResult?.count || 0;

    // Get new patients this month
    const [newThisMonthResult] = await all(`
      SELECT COUNT(*) as count
      FROM patients
      WHERE strftime('%Y-%m', registration_date) = strftime('%Y-%m', 'now')
    `);
    const newThisMonth = newThisMonthResult?.count || 0;

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
