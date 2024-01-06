import { GoogleSpreadsheet } from "google-spreadsheet";
import serviceAccountAuth from "../services/google.js";

import { modex_regex, qual_report_comparator } from './util.js';

const GOOGLE_SHEET_ID_224 = "1G58gg-BKW-fpYPudBMDZztFism5FJ_OME9kvzvjxm2w";
const TRAINING_SHEET_INDEX = 0;

// @param string[] present_modices -- array of strings containing 2-3 digit modices of each pilot present in the 224 Ready Room at the time of execution. If nil print training info for the entire roster
// @returns string -- containing the generated report TODO consider returning an object so it can be formatted with discord message components
export async function generate(present_modices) {
  
  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID_224, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[TRAINING_SHEET_INDEX]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  // grab all cells now since we'll need to check (almost) all of them
  const cells = await sheet.loadCells();
  
  const nROWS = sheet.rowCount;
  const nCOLS = sheet.columnCount;
  
  const DATA_ROW_START = 4;
  const DATA_COL_START = 2;

  const PILOT_ROW = 2;
  const QUAL_COL = 1;

  // get current pilot name strings from the pilot header row
  const pilots = {}; 
  const quals = {};
  
  for (let i = DATA_COL_START; i < nCOLS; i++) {
    pilots[sheet.getCell(PILOT_ROW, i).value] 
  }

  // TODO can probably use a little more abstraction instead of copypasta static code but it works and IQT, MCQ, CMQ, CQ and supplemental are well-defined categories
  // row boundaries will be different for different CSG3 squadrons
  const IQT_qual_count_map = {};
  const MCQ_qual_count_map = {};
  const CQ_qual_count_map = {};
  const CMQ_qual_count_map = {};
  const supplemental_qual_count_map = {};

  // save all quals
  const quals = [];
  // temp/loop variables
  let cell_value;
  let qual;
  let pilot_str;
  let pilot_modex;

  const IQT_qual_reports = [];
  const MCQ_qual_reports = [];
  const CQ_qual_reports = [];
  const CMQ_qual_reports = [];
  const supplemental_qual_reports = [];
  
  
}
