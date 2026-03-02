/**
 * EHR Lite Backend Server
 * Local-first Electronic Health Record System
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { startAutoSave } from './db/connection.js';
import { getStats } from './db/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import routes
import patientRoutes from './routes/patients.js';
import imageRoutes from './routes/images.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = 4000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// STATIC FILES - Serve patient images
// ============================================================================

const projectRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(projectRoot, 'data', 'patient-images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.use('/images', cors(), express.static(imagesDir));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    name: 'EHR Lite API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      dashboard: {
        stats: 'GET /api/dashboard/stats'
      },
      patients: {
        list: 'GET /api/patients',
        create: 'POST /api/patients',
        get: 'GET /api/patients/:id',
        update: 'PUT /api/patients/:id',
        delete: 'DELETE /api/patients/:id',
        vitals: 'GET /api/patients/:id/vitals',
        history: 'GET /api/patients/:id/history',
        habits: 'GET /api/patients/:id/habits',
        diagnoses: 'GET /api/patients/:id/diagnoses'
      },
      images: {
        upload: 'POST /api/images',
        getByEntity: 'GET /api/images?entity_type=&entity_id=',
        delete: 'DELETE /api/images/:id'
      },
      reports: {
        list: 'GET /api/reports',
        create: 'POST /api/reports',
        get: 'GET /api/reports/:id',
        delete: 'DELETE /api/reports/:id'
      }
    }
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/patients', patientRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, async () => {
  console.log('='.repeat(60));
  console.log('EHR Lite Backend Server');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`API endpoint:    http://localhost:${PORT}/api`);
  console.log(`Health check:    http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));

  // Start auto-save for database
  startAutoSave();
  console.log('Database auto-save enabled (every 5 seconds)');

  // Show database stats
  try {
    const stats = await getStats();
    console.log(`Database: ${stats.path}`);
    console.log(`Tables: ${stats.tables}`);
    console.log(' '.repeat(60) + '\n');
  } catch (error) {
    console.log('Database will be initialized on first request...\n');
  }
});

export default app;
