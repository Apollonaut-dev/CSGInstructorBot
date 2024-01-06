import { GoogleSpreadsheet } from "google-spreadsheet";
import serviceAccountAuth from "../services/google.js";

import { modex_regex, qual_report_comparator } from './util.js';

const GOOGLE_SHEET_ID_224 = "1G58gg-BKW-fpYPudBMDZztFism5FJ_OME9kvzvjxm2w";
const TRAINING_SHEET_INDEX = 0;

const N_ROWS = 138;
const N_COLS = 27;

const DATA_ROW_START = 4;
const DATA_COL_START = 2;

const PILOT_ROW = 2;
const QUAL_COL = 1;


// @param string[] present_modices -- array of strings containing 2-3 digit modices of each pilot present in the 224 Ready Room at the time of execution. If nil print training info for the entire roster
// @returns string -- containing the generated report TODO consider returning an object so it can be formatted with discord message components
export async function generate(present_modices) {
  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID_224, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[TRAINING_SHEET_INDEX]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  // grab all cells now since we'll need to check (almost) all of them
  const cells = await sheet.loadCells("A1:AA");

  // get current pilot name strings from the pilot header row
  const pilots = [];
  for (let i = DATA_COL_START; i < N_COLS; i++) {
    pilots.push(sheet.getCell(PILOT_ROW, i).value);
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
  for (let i = CMQ_START; i < SUPPLEMENTAL_START; i++) {
    
  }

  // Supplemental
  const supplemental_qual_reports = [];

  // sort and build report strings
  /*
    TODO:
    I used a map to hold the qual data in case I need to extend the featureset, 
    but this requires a second loop through the quals 
    (in addition to the nlog2(n) sorting)
    
    TODO: eliminate the slow for..of loops in this section
  */

  // temp placeholder array
//   let array;
//   let report_string = "<<<<<<< TRAINING REPORT >>>>>>>\n";
//   // IQT handling
//   // tbh I think it is sufficient to report IQT checkrides only
//   report_string += "======= IQT Report =======\n";
//   const IQT_checkride = IQT_qual_count_map["IQT Check Ride"];
//   report_string += `Eligible for IQT checkride: ${
//     IQT_checkride.count
//   }\n\t${IQT_checkride.pilots.join(", ")}\n`;
//   // IQT breakdown ommitted but it would be similar to the following two for...loops

//   // MCQ checkrides
//   const MCQ_checkride_day = MCQ_qual_count_map["MCQ Check Ride (Day IFR)"];
//   const MCQ_checkride_night = MCQ_qual_count_map["MCQ Check Ride (Night)"];
//   report_string += "\n======= MCQ Report =======\n";
//   report_string += `Eligible for MCQ Checkride (Day IFR): ${
//     MCQ_checkride_day.count
//   }\n\t${MCQ_checkride_day.pilots.join(", ")}\n`;
//   report_string += `Eligible for MCQ Checkride (Night): ${
//     MCQ_checkride_night.count
//   }\n\t${MCQ_checkride_night.pilots.join(", ")}\n`;

//   let sorted = MCQ_qual_reports.sort(qual_report_comparator);
//   let entry;
//   for (let i = 0; i < Math.min(sorted.length, 5); i++) {
//     entry = sorted[i];
//     if (entry.count == 0) continue;
//     report_string += `\t${entry.qual}\n\t${
//       entry.count
//     } -- Eligible: \t${entry.pilots.join(", ")}\n`;
//   }
  
//   // CMQ
//   report_string += "\n======= CMQ Report =======\n";
//   sorted = CMQ_qual_reports.sort(qual_report_comparator);
//   for (let i = 0; i < Math.min(sorted.length, 5); i++) {
//     entry = sorted[i];
//     if (entry.count == 0) continue;
//     report_string += `\t${entry.qual}\n\t${
//       entry.count
//     } -- Eligible: \t${entry.pilots.join(", ")}\n`;
//   }

//   // Supplemental
//   report_string += "\n======= Supplementals =======\n";
//   sorted = supplemental_qual_reports.sort(qual_report_comparator);
//   for (let i = 0; i < Math.min(sorted.length, 5); i++) {
//     entry = sorted[i];
//     if (entry.count == 0) continue;
//     report_string += `\t${entry.qual}\n\t${
//       entry.count
//     } -- Eligible: \t${entry.pilots.join(", ")}\n`;
//   }
//   return report_string;
}
