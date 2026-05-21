const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

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

    proc.stdout.on('data', d => console.log(`[${label}]`, d.toString().trim()));
    proc.stderr.on('data', d => console.error(`[${label} error]`, d.toString().trim()));

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
    console.log('[db] Seed complete, flag written');
  } else {
    console.log('[db] Already seeded, skipping');
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

    backendProcess = spawn(NODE_BIN, [BACKEND_ENTRY], {
      cwd: path.join(ROOT, 'backend'),
      env,
      stdio: 'pipe',
    });

    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log('[backend]', msg);
      // Resolve once the backend confirms it's listening
      if (msg.includes('listening') || msg.includes('started') || msg.includes('4000')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('[backend error]', data.toString());
    });

    backendProcess.on('error', reject);
    backendProcess.on('exit', (code) => {
      console.log(`[backend] exited with code ${code}`);
    });

    // Fallback resolve after 3 seconds in case the log message differs
    setTimeout(resolve, 3000);
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

    frontendProcess = spawn(NODE_BIN, [FRONTEND_ENTRY], {
      cwd: path.join(ROOT, 'frontend', '.next', 'standalone', 'frontend'),
      env,
      stdio: 'pipe',
    });

    frontendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log('[frontend]', msg);
      if (msg.includes('ready') || msg.includes('started') || msg.includes('3000') || msg.includes('listening')) {
        resolve();
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error('[frontend error]', data.toString());
    });

    frontendProcess.on('error', reject);
    frontendProcess.on('exit', (code) => {
      console.log(`[frontend] exited with code ${code}`);
    });

    setTimeout(resolve, 5000);
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
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'EHR Lite',
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

    // Create data directories if first launch
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.mkdirSync(path.join(DATA_DIR, 'patient-images'), { recursive: true });
    }

    // Check if ports are already in use
    try {
      await Promise.all([waitForPort(3000, 2, 100), waitForPort(4000, 2, 100)]);
      // If we get here, ports are already in use
      dialog.showErrorBox(
        'Port Conflict',
        'EHR Lite cannot start because ports 3000 or 4000 are already in use.\n\nPlease close other applications using these ports and try again.'
      );
      app.quit();
      return;
    } catch (e) {
      // Ports are available, continue
    }

    await initDatabase();
    await Promise.all([startBackend(), startFrontend()]);
    await Promise.all([waitForPort(4000), waitForPort(3000)]);
    createWindow();
  } catch (err) {
    dialog.showErrorBox(
      'Startup Failed',
      `EHR Lite could not start:\n\n${err.message}\n\nPlease contact support.`
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
