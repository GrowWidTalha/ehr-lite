/**
 * Image Handler
 * Manages image storage and retrieval
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is the backend directory (where package.json is)
const projectRoot = path.resolve(__dirname, '../..');
const imagesDir = path.join(projectRoot, 'data', 'patient-images');

/**
 * Ensure patient images directory exists
 */
export function ensureImagesDir() {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
}

/**
 * Get patient image directory path
 */
export function getPatientImageDir(patientId) {
  const dir = path.join(imagesDir, patientId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Generate image filename
 * Format: {entity_type}-{record_id}-{sequence}.{ext}
 */
export function generateImageFilename(entityType, recordId, sequence, extension = 'jpg') {
  const sanitizedEntityType = entityType.replace('_', '-');
  return `${sanitizedEntityType}-${recordId}-${sequence}.${extension}`;
}

/**
 * Save image file
 */
export function saveImage(patientId, filename, buffer) {
  const dir = getPatientImageDir(patientId);
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, buffer);

  return `/patient-images/${patientId}/${filename}`;
}

/**
 * Delete image file
 */
export function deleteImage(imagePath) {
  const fullPath = path.join(projectRoot, 'data', imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}

/**
 * Get image file info
 */
export function getImageInfo(imagePath) {
  const fullPath = path.join(projectRoot, 'data', imagePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const stats = fs.statSync(fullPath);
  const ext = path.extname(fullPath).slice(1);
  const filename = path.basename(fullPath);

  return {
    path: imagePath,
    fullPath,
    filename,
    fileType: ext,
    fileSize: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
}

/**
 * Validate file type
 */
export function isValidImageType(filename) {
  const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
  const ext = path.extname(filename).toLowerCase().slice(1);
  return validTypes.includes(ext);
}

/**
 * Validate file size (max 5MB)
 */
export function isValidImageSize(size) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return size <= maxSize;
}
