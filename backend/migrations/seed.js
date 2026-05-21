import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'database.db')
  : path.resolve(__dirname, '../data/database.db');
const lookupData = JSON.parse(fs.readFileSync(path.join(__dirname, 'lookup_data.json'), 'utf-8'));

const SQL = await initSqlJs();
const buffer = fs.readFileSync(dbPath);
const db = new SQL.Database(buffer);

const seed = (table, valueCol, rows) => {
  let count = 0;
  for (const row of rows) {
    if (row.ID == null || row[valueCol] == null) continue;
    try {
      db.run(
        `INSERT OR IGNORE INTO ${table} (ID, ${valueCol}) VALUES (?, ?)`,
        [row.ID, row[valueCol]]
      );
      count++;
    } catch (e) {
      console.error(`❌ ${table} row ${row.ID}: ${e.message}`);
    }
  }
  console.log(`✅ ${table}: ${count} rows`);
};

seed('Addictions',     'Addiction',          lookupData.Addictions);
seed('BloodGroups',    'BloodGroup',         lookupData.BloodGroups);
seed('BrainTumors',    'HistrologicalTypes', lookupData.BrainTumors);
seed('BreastCancer',   'BreastCancer',       lookupData.BreastCancer);
seed('Carcinoma',      'Carcinoma',          lookupData.Carcinoma);
seed('Diseases',       'Diseases',           lookupData.Diseases);
seed('District',       'District',           lookupData.District);
seed('Drinks',         'Drinks',             lookupData.Drinks);
seed('Duration',       'Duration',           lookupData.Duration);
seed('Foods',          'Food',               lookupData.Foods);
seed('Genitourinary',  'Genitourinary',      lookupData.Genitourinary);
seed('GITumors',       'GITumors',           lookupData.GITumors);
seed('Gynecological',  'Gynecological',      lookupData.Gynecological);
seed('HeadNeckCancer', 'HeadNeckCancer',     lookupData.HeadNeckCancer);
seed('Hematological',  'Hematological',      lookupData.Hematological);
seed('Hospitals',      'Hospitals',          lookupData.Hospitals);
seed('Laboratories',   'LabName',            lookupData.Laboratories);
seed('LungsCancer',    'LungsCancer',        lookupData.LungsCancer);
seed('MotherTongue',   'MotherTongue',       lookupData.MotherTongue);
seed('Occupation',     'Occupation',         lookupData.Occupation);
seed('Province',       'Province',           lookupData.Province);
seed('Qualifications', 'QLevel',             lookupData.Qualifications);
seed('Relations',      'Relations',          lookupData.Relations);
seed('Sarcoma',        'Sarcoma',            lookupData.Sarcoma);
seed('SkinTumor',      'SkinTumor',          lookupData.SkinTumor);
seed('Sports',         'Sports',             lookupData.Sports);
seed('SurgeryList',    'SurgeryType',        lookupData.SurgeryList);
seed('TypeOfSamples',  'TypeOfSample',       lookupData.TypeOfSamples);

const data = db.export();
fs.writeFileSync(dbPath, Buffer.from(data));
db.close();

console.log('\n✅ All seed data inserted and database saved');