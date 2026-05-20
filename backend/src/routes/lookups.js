/**
 * Lookups Route
 * Returns all lookup table data for frontend dropdowns
 */

import express from "express";
import { all } from "../db/query.js";

const router = express.Router();

/**
 * GET /api/lookups
 * Returns all lookup table data
 */
router.get("/", async (req, res) => {
  try {
    const result = {
      bloodGroups: await all("SELECT * FROM BloodGroups"),
      hospitals: await all("SELECT * FROM Hospitals"),
      laboratories: await all("SELECT * FROM Laboratories"),
      occupations: await all("SELECT * FROM Occupation"),
      qualifications: await all("SELECT * FROM Qualifications"),
      motherTongues: await all("SELECT * FROM MotherTongue"),
      districts: await all("SELECT * FROM District"),
      provinces: await all("SELECT * FROM Province"),
      relations: await all("SELECT * FROM Relations"),
      sports: await all("SELECT * FROM Sports"),
      durations: await all("SELECT * FROM Duration"),
      typeOfSamples: await all("SELECT * FROM TypeOfSamples"),
      diseases: await all("SELECT * FROM Diseases"),
      addictions: await all("SELECT * FROM Addictions"),
      drinks: await all("SELECT * FROM Drinks"),
      foods: await all("SELECT * FROM Foods"),
      cancerTypes: {
        brainTumors: await all("SELECT * FROM BrainTumors"),
        breastCancer: await all("SELECT * FROM BreastCancer"),
        carcinoma: await all("SELECT * FROM Carcinoma"),
        genitourinary: await all("SELECT * FROM Genitourinary"),
        giTumors: await all("SELECT * FROM GITumors"),
        gynecological: await all("SELECT * FROM Gynecological"),
        headNeckCancer: await all("SELECT * FROM HeadNeckCancer"),
        hematological: await all("SELECT * FROM Hematological"),
        lungsCancer: await all("SELECT * FROM LungsCancer"),
        sarcoma: await all("SELECT * FROM Sarcoma"),
        skinTumor: await all("SELECT * FROM SkinTumor"),
      },
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching lookups:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
