const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

let LOG_FILE;
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch (_) {}
  console.log(msg);
}

let mainWindow = null;
let backendProcess = null;
let frontendProcess = null;

// Resolve paths relative to the packaged app or dev environment
const isPackaged = app.isPackaged;

const ROOT = isPackaged
  ? path.join(process.resourcesPath, 'app')
  : path.join(__dirname, '..');

const BACKEND_ENTRY = path.join(ROOT, 'backend', 'src', 'server.js');
const FRONTEND_ENTRY = path.join(ROOT, 'frontend', '.next', 'standalone', 'frontend', 'server.js');

// Migration and seed paths
const MIGRATE_ENTRY = path.join(ROOT, 'backend', 'migrations', 'migrate.js');
const SEED_ENTRY = path.join(ROOT, 'backend', 'migrations', 'seed.js');

// User data directory for database and uploads (will be set in app.whenReady)
let USER_DATA, DATA_DIR, SEED_FLAG;

// Node binary path - use system node in dev, bundled node in production
const NODE_BIN = isPackaged
  ? path.join(process.resourcesPath, 'node', 'node.exe')
  : 'node';

function runScript(scriptPath, label) {
  return new Promise((resolve, reject) => {
    const proc = spawn(NODE_BIN, [scriptPath], {
      cwd: path.join(ROOT, 'backend'),
      env: {
        ...process.env,
        DATA_DIR: DATA_DIR,
        NODE_ENV: 'production',
      },
      stdio: 'pipe',
    });

    proc.stdout.on('data', d => log(`[${label}] ${d.toString().trim()}`));
    proc.stderr.on('data', d => log(`[${label} error] ${d.toString().trim()}`));

    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with exit code ${code}`));
    });

    proc.on('error', reject);
  });
}

async function initDatabase() {
  await runScript(MIGRATE_ENTRY, 'migrate');

  if (!fs.existsSync(SEED_FLAG)) {
    await runScript(SEED_ENTRY, 'seed');
    fs.writeFileSync(SEED_FLAG, new Date().toISOString());
    log('[db] Seed complete, flag written');
  } else {
    log('[db] Already seeded, skipping');
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: '4000',
      NODE_ENV: 'production',
      DATA_DIR: DATA_DIR,
    };

    log('[backend] Starting with DATA_DIR: ' + DATA_DIR);

    backendProcess = spawn(NODE_BIN, [BACKEND_ENTRY], {
      cwd: path.join(ROOT, 'backend'),
      env,
      stdio: 'pipe',
    });

    let resolved = false;

    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      log('[backend] ' + msg.trim());
      // Resolve once the backend confirms it's listening
      if (!resolved && (msg.includes('listening') || msg.includes('started') || msg.includes('4000') || msg.includes('Server running'))) {
        resolved = true;
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      log('[backend error] ' + msg.trim());
      // Don't reject on stderr, some libraries log to stderr
    });

    backendProcess.on('error', (err) => {
      log('[backend] Failed to start: ' + err);
      reject(err);
    });

    backendProcess.on('exit', (code, signal) => {
      log(`[backend] exited with code ${code}, signal ${signal}`);
      if (!resolved && code !== 0) {
        reject(new Error(`Backend exited with code ${code}`));
      }
    });

    // Fallback resolve after 5 seconds in case the log message differs
    setTimeout(() => {
      if (!resolved) {
        log('[backend] Timeout reached, assuming started');
        resolved = true;
        resolve();
      }
    }, 5000);
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: '3000',
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000',
    };

    log('[frontend] Starting...');

    frontendProcess = spawn(NODE_BIN, [FRONTEND_ENTRY], {
      cwd: path.join(ROOT, 'frontend', '.next', 'standalone', 'frontend'),
      env,
      stdio: 'pipe',
    });

    let resolved = false;

    frontendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      log('[frontend] ' + msg.trim());
      if (!resolved && (msg.includes('ready') || msg.includes('started') || msg.includes('3000') || msg.includes('listening') || msg.includes('Local'))) {
        resolved = true;
        resolve();
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      // Filter out Next.js build warnings
      if (!msg.includes('Experiment') && !msg.includes('Fetched') && !msg.includes('package')) {
        log('[frontend error] ' + msg.trim());
      }
    });

    frontendProcess.on('error', (err) => {
      log('[frontend] Failed to start: ' + err);
      reject(err);
    });

    frontendProcess.on('exit', (code, signal) => {
      log(`[frontend] exited with code ${code}, signal ${signal}`);
      if (!resolved && code !== 0) {
        reject(new Error(`Frontend exited with code ${code}`));
      }
    });

    // Frontend takes longer, give it 8 seconds
    setTimeout(() => {
      if (!resolved) {
        log('[frontend] Timeout reached, assuming started');
        resolved = true;
        resolve();
      }
    }, 8000);
  });
}

function waitForPort(port, retries = 20, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const req = http.get(`http://localhost:${port}`, () => resolve());
      req.on('error', () => {
        if (n <= 0) return reject(new Error(`Port ${port} not ready`));
        setTimeout(() => attempt(n - 1), delay);
      });
      req.end();
    };
    attempt(retries);
  });
}

function createWindow() {
  const iconPath = isPackaged
    ? path.join(process.resourcesPath, 'app', 'electron', 'assets', 'icon.ico')
    : path.join(__dirname, 'assets', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'EHR Lite',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // show only after content loads
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function killProcesses() {
  [backendProcess, frontendProcess].forEach((proc) => {
    if (!proc) return;
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  });
  backendProcess = null;
  frontendProcess = null;
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

// User picks a folder to save the backup zip into
ipcMain.handle('dialog:selectBackupDestination', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Backup',
    defaultPath: `EHR-Backup-${new Date().toISOString().split('T')[0]}.zip`,
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
    properties: [],
  });
  return result.canceled ? null : result.filePath;
});

// User picks a zip file to restore from
ipcMain.handle('dialog:selectRestoreFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Backup to Restore',
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
    properties: ['openFile'],
  });
  return result.canceled ? null : result.filePaths[0];
});

// ============================================================================
// APP LIFECYCLE
// ============================================================================

app.whenReady().then(async () => {
  try {
    // Initialize user data paths (must be done inside app.whenReady)
    USER_DATA = app.getPath('userData');
    DATA_DIR = path.join(USER_DATA, 'data');
    SEED_FLAG = path.join(DATA_DIR, '.seeded');
    LOG_FILE = path.join(USER_DATA, 'startup.log');

    log('=== EHR Lite Startup ===');
    log('USER_DATA: ' + USER_DATA);
    log('DATA_DIR: ' + DATA_DIR);
    log('isPackaged: ' + isPackaged);
    log('ROOT: ' + ROOT);
    log('NODE_BIN: ' + NODE_BIN);

    // Create data directories if first launch
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.mkdirSync(path.join(DATA_DIR, 'patient-images'), { recursive: true });
      log('[startup] Created data directories');
    }

    // Check if ports are already in use
    try {
      await Promise.all([waitForPort(3000, 2, 100), waitForPort(4000, 2, 100)]);
      // If we get here, ports are already in use
      const result = dialog.showMessageBoxSync({
        type: 'error',
        title: 'Port Conflict',
        message: 'EHR Lite cannot start because ports 3000 or 4000 are already in use.',
        detail: 'This usually means:\n\n1. Another instance of EHR Lite is already running\n2. Another application is using these ports\n\nPlease close other applications and try again.\n\nIf the problem persists, restart your computer.',
        buttons: ['OK', 'Open Task Manager'],
        defaultId: 0,
      });

      if (result === 1) {
        // User clicked "Open Task Manager"
        require('child_process').spawn('taskmgr');
      }
      app.quit();
      return;
    } catch (e) {
      // Ports are available, continue
      log('[startup] Ports 3000 and 4000 are available');
    }

    await initDatabase();
    await Promise.all([startBackend(), startFrontend()]);
    await Promise.all([waitForPort(4000), waitForPort(3000)]);
    createWindow();
  } catch (err) {
    log('[startup] ERROR: ' + err.message);
    log('[startup] Stack: ' + err.stack);
    dialog.showErrorBox(
      'Startup Failed',
      `EHR Lite could not start:\n\n${err.message}\n\nCheck startup log at:\n${LOG_FILE}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  killProcesses();
  app.quit();
});

app.on('before-quit', () => {
  killProcesses();
});

app.on('quit', () => {
  killProcesses();
});
