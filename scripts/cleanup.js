/**
 * EHR Lite Cleanup Utility
 *
 * This script helps clean up old EHR Lite installations on Windows.
 * Run with: node scripts/cleanup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== EHR Lite Cleanup Utility ===\n');

// Windows user data path
const userDataPath = path.join(process.env.APPDATA, 'EHR Lite');

console.log('Checking for EHR Lite data at:', userDataPath);

if (fs.existsSync(userDataPath)) {
  console.log('\n✅ Found EHR Lite user data directory');

  // List contents
  const contents = fs.readdirSync(userDataPath);
  console.log('\nContents:');
  contents.forEach(item => {
    const itemPath = path.join(userDataPath, item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const subContents = fs.readdirSync(itemPath);
      console.log(`  📁 ${item}/ (${subContents.length} items)`);
    } else {
      console.log(`  📄 ${item} (${formatBytes(stats.size)})`);
    }
  });

  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will DELETE all patient data and settings!');
  console.log('    Make sure you have a backup before proceeding.\n');

  // Check for database
  const dbPath = path.join(userDataPath, 'data', 'database.db');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`Database size: ${formatBytes(stats.size)}`);
    console.log(`Last modified: ${stats.mtime.toLocaleString()}`);
  }

  console.log('\nTo remove this data, run: node scripts/cleanup.js --delete');
  console.log('Or manually delete: %APPDATA%\\EHR Lite');

} else {
  console.log('❌ No EHR Lite user data found');
  console.log('   The app may never have been run on this computer.');
}

// Check for running processes
console.log('\nChecking for running Node.js processes...');
try {
  const output = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
  const lines = output.split('\n').filter(line => line.includes('node.exe'));
  if (lines.length > 1) {
    console.log(`⚠️  Found ${lines.length - 1} node.exe process(es) running`);
    console.log('   These might be EHR Lite processes');
  } else {
    console.log('✅ No node.exe processes found');
  }
} catch (error) {
  console.log('Unable to check processes');
}

// Check port usage
console.log('\nChecking ports 3000 and 4000...');
try {
  execSync('netstat -ano | findstr :3000 | findstr LISTENING', { stdio: 'pipe' });
  console.log('⚠️  Port 3000 is in use');
} catch {
  console.log('✅ Port 3000 is available');
}

try {
  execSync('netstat -ano | findstr :4000 | findstr LISTENING', { stdio: 'pipe' });
  console.log('⚠️  Port 4000 is in use');
} catch {
  console.log('✅ Port 4000 is available');
}

console.log('\n=== End of cleanup check ===');

// Handle --delete flag
if (process.argv.includes('--delete')) {
  console.log('\n🗑️  DELETING EHR Lite data...');
  try {
    fs.rmSync(userDataPath, { recursive: true, force: true });
    console.log('✅ Successfully deleted:', userDataPath);
  } catch (error) {
    console.error('❌ Error deleting:', error.message);
    console.log('   You may need to run as Administrator or close the app first');
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
