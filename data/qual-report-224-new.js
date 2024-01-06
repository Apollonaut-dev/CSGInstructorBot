import { GoogleSpreadsheet } from "google-spreadsheet";
import serviceAccountAuth from "../services/google.js";

import { modex_regex, qual_report_comparator } from './util.js';

const GOOGLE_SHEET_ID_224 = "1G58gg-BKW-fpYPudBMDZztFism5FJ_OME9kvzvjxm2w";
const TRAINING_SHEET_INDEX = 0;

generate([403, 460, 402, 401, 453])

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
  const DATA_COL_START = 3;

  const PILOT_ROW = 2;
  const QUAL_COL = 1;

  // get current pilot name strings from the pilot header row
  const pilots = {}; 
  const quals = {};
  
  let pilot;
  let milestone;
  let category;
  let qual;
  let entry;
  let modex;
  
  for (let i = DATA_ROW_START; i < nROWS; i++) {
    milestone = sheet.getCell(i, 1).value;
    category = sheet.getCell(i, 2).value;
    qual = sheet.getCell(i, 3).value;
    
    if (!quals[milestone]) quals[milestone] = {};
    if (!quals[milestone][category]) quals[milestone][category] = {};
    if (!quals[milestone][category][qual]) quals[milestone][category][qual] = [];
    console.log(`${milestone}-${category}-${qual}`);
    for (let j = DATA_COL_START; j < nCOLS; j++) {
      entry = sheet.getCell(i, j).value;
      if (entry == 'NOGO') continue;
      pilot = sheet.getCell(PILOT_ROW, j).value
      modex = Number(pilot.match(modex_regex));
      if (!present_modices.include(modex)) continue;
      quals[milestone][category][qual].push(pilot)
    }
  }
  
}
