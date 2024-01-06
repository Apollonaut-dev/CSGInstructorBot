import { GoogleSpreadsheet } from "google-spreadsheet";
import serviceAccountAuth from "../services/google.js";

import { modex_regex, qual_report_comparator } from './util.js';

const GOOGLE_SHEET_ID_224 = "1G58gg-BKW-fpYPudBMDZztFism5FJ_OME9kvzvjxm2w";
const TRAINING_SHEET_INDEX = 1;

generate([403, 460, 402, 401, 453, 413, 415, 416, 417, 460])

// @param string[] present_modices -- array of strings containing 2-3 digit modices of each pilot present in the 224 Ready Room at the time of execution. If nil print training info for the entire roster
// @returns string -- containing the generated report TODO consider returning an object so it can be formatted with discord message components
export async function generate(present_modices) {
  console.log(present_modices);
  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID_224, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[TRAINING_SHEET_INDEX]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  // grab all cells now since we'll need to check (almost) all of them
  const cells = await sheet.loadCells();
  
  const nROWS = sheet.rowCount;
  const nCOLS = sheet.columnCount;
  
  const DATA_ROW_START = 5;
  const DATA_COL_START = 3;

  const PILOT_ROW = 1;
  const QUAL_COL = 1;

  // get current pilot name strings from the pilot header row
  const pilots = {}; 
  const quals = {};
  
  let pilot;
  
  let milestone;
  let prev_milestone;
  
  let category;
  let prev_category;
  
  let qual;
  let prev_qual;
  
  let entry;
  let modex;
  
  for (let i = DATA_ROW_START; i < 122; i++) {
    milestone = sheet.getCell(i, 0).value;
    category = sheet.getCell(i, 1).value;
    qual = sheet.getCell(i, 2).value;
    
    // console.log(`${milestone}:${prev_milestone}`);
    
    if (milestone != null) prev_milestone = milestone;
    if (category != null) prev_category = category;
    if (qual != null) prev_qual = qual;
    
    if (!quals[prev_milestone]) quals[prev_milestone] = {};
    if (!quals[prev_milestone][prev_category]) quals[prev_milestone][prev_category] = {};
    if (!quals[prev_milestone][prev_category][prev_qual]) quals[prev_milestone][prev_category][prev_qual] = [];
    
    console.log(`${prev_milestone} | ${prev_category} | ${prev_qual}`);
    
    for (let j = DATA_COL_START; j < nCOLS; j++) {
      entry = sheet.getCell(i, j).value;
      // console.log(`entry: ${entry}`)
      if (entry != 'NOGO' && entry != 'FOCUS') continue;
      pilot = sheet.getCell(PILOT_ROW, j).value
      // console.log(`pilot: ${pilot}`)
      if (!pilot) continue;
      modex = Number(pilot.match(modex_regex));
      // console.log(`modex: ${modex}`)
      // console.log(`![${present_modices}].includes(${modex}): ${present_modices.includes(modex)}`);
      if (!present_modices.includes(modex)) continue;
      
      // console.log(`modex: ${modex}`)
      quals[prev_milestone][prev_category][prev_qual].push(pilot);
    }
    console.log(quals[prev_milestone][prev_category][prev_qual].join(', '))
  }
  return;
}
