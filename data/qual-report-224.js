import { GoogleSpreadsheet } from "google-spreadsheet";
import { inspect } from 'util';
import serviceAccountAuth from "../services/google.js";

import { modex_regex, qual_report_comparator } from './util.js';

const GOOGLE_SHEET_ID_224 = "1G58gg-BKW-fpYPudBMDZztFism5FJ_OME9kvzvjxm2w";
const TRAINING_SHEET_INDEX = 0;

//testing
console.log("Testing 224...")
generate([400, 401, 402, 403, 404, 405, 406, 407, 410, 411, 412, 413, 414, 415, 416, 417, 450, 451, 452, 453, 454, 456, 457, 460])

// @param string[] present_modices -- array of strings containing 2-3 digit modices of each pilot present in the 224 Ready Room at the time of execution. If nil print training info for the entire roster
// @returns string -- containing the generated report TODO consider returning the object so it can be formatted with discord message components
export async function generate(present_modices) {
  const _MS_MONTH = 30*24*60*60*1000;
  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID_224, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[TRAINING_SHEET_INDEX]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  // grab all cells now since we'll need to check (almost) all of them
  const cells = await sheet.loadCells();
  
  const nROWS = sheet.rowCount;
  const nCOLS = sheet.columnCount;
  
  const DATA_ROW_START = 5;
  const DATA_COL_START = 3;
  // console.log(`sheet.getCell(3,${nCOLS-1}).value = ${sheet.getCell(3,nCOLS-1).value}`);

  const PILOT_ROW = 1;
  const CaseIReQual = 3;
  const CaseIIIReQual = 4;
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
  
  let arr;
  
  for (let i = DATA_ROW_START; i < 122; i++) {
    milestone = sheet.getCell(i, 0).value;
    category = sheet.getCell(i, 1).value;
    qual = sheet.getCell(i, 2).value;
    
    if (milestone != null) prev_milestone = milestone;
    if (category != null) prev_category = category;
    if (qual != null) prev_qual = qual;
    
    if (!quals[prev_milestone]) quals[prev_milestone] = {};
    if (!quals[prev_milestone][prev_category]) quals[prev_milestone][prev_category] = {};
    
    arr = [];
    for (let j = DATA_COL_START; j < nCOLS; j++) {
      entry = sheet.getCell(i, j).value;
      if (entry != 'NOGO' && entry != 'FOCUS') continue;
      pilot = sheet.getCell(PILOT_ROW, j).value
      if (!pilot) continue;
      modex = Number(pilot.match(modex_regex));
      if (!present_modices.includes(modex)) continue;
      arr.push(pilot)
    }
    
    if (arr.length) {
      if (!quals[prev_milestone][prev_category][prev_qual]) quals[prev_milestone][prev_category][prev_qual] = arr;
    }
  }
  let milestone_flattened = {};
  let flattened;
  
  for (const [kMilestone, vCategory] of Object.entries(quals)) {
    flattened = {};
    for (const [kCategory, vQual] of Object.entries(vCategory)) {
      flattened = {...flattened, ...vQual}
    }
    milestone_flattened[kMilestone] = flattened;
  }
  
  let str = "**=== Upcoming and overdue CQ expiries ===**\n";
  str += '\t*Case I*\n'
  const today = new Date();
  const utc_today = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  let qual_date; 
  let diff;
  
  let needs_caseI = []
  for (let j = DATA_COL_START; j < nCOLS; j++) {
    
    entry = sheet.getCell(3, j).value;
    if (!entry) entry = 0;
    
    // google sheets epoch: 1899-12-30
    // https://developers.google.com/sheets/api/guides/formats?hl=en
    qual_date = new Date(`${1899}-${12}-${30}`)
    qual_date.setDate(qual_date.getDate() + Number(entry))
    
    // const utc_qual = Date.UTC(qual_date.getFullYear(), qual_date.getMonth(), qual_date.getDate());
    const utc_qual = Date.UTC(1899, 12, 30 + Number(entry));
    
    diff = Math.floor(utc_today - utc_qual)/_MS_MONTH;
    
    if (diff < 5) continue;
    pilot = sheet.getCell(PILOT_ROW, j).value
    if (!pilot) continue;
    modex = Number(pilot.match(modex_regex));
    if (!present_modices.includes(modex)) continue;
    needs_caseI.push(pilot);
  }
  str += '\t\t' + needs_caseI.join(', ') + '\n'
  
  str += '\t*Case III*\n'
  // console.log(inspect(milestone_flattened, {
  //   depth: null,
  //   colorized: true
  // }));
  let needs_caseIII = []
  for (let j = DATA_COL_START; j < nCOLS; j++) {
    
    entry = sheet.getCell(4, j).value;
    if (!entry) entry = 0;
    
    // google sheets epoch: 1899-12-30
    // https://developers.google.com/sheets/api/guides/formats?hl=en
    qual_date = new Date(`${1899}-${12}-${30}`)
    qual_date.setDate(qual_date.getDate() + Number(entry))
    const utc_qual = Date.UTC(1899, 12, 30 + Number(entry));
    
    diff = Math.floor(utc_today - utc_qual)/_MS_MONTH;
    
    if (diff < 5) continue;
    pilot = sheet.getCell(PILOT_ROW, j).value
    if (!pilot) continue;
    modex = Number(pilot.match(modex_regex));
    if (!present_modices.includes(modex)) continue;
    needs_caseIII.push(pilot);
  }
  str += '\t\t' + needs_caseIII.join(', ') + '\n'
  // console.log(inspect(milestone_flattened, {
  //   depth: null,
  //   colorized: true
  // }));
  arr = [];
  for (const [kMilestone, vQuals] of Object.entries(milestone_flattened)) {
    str += `**=== ${kMilestone} ===**\n`;
    arr = Object.entries(vQuals).sort((a, b) => b[1].length - a[1].length)
    for (let i = 0; i < Math.min(3, arr.length); i++) {
      str += `\t*${arr[i][0]}: ${vQuals[arr[i][0]].length}*\n`
      str += `\t\t${vQuals[arr[i][0]].join(', ')}\n`
    }
    console.log(inspect(milestone_flattened, {
      depth: null,
      colorized: true
    }));
    console.log(inspect(arr.map(e => {
      return [e[0], e[1].length]
    }), {
      depth: null,
      colorizeD: true
    }));
    console.log("=============== MILESTONE BOUNDARY =================")
  }
  // console.log(inspect(milestone_flattened, {
  //   depth: null,
  //   colorized: true
  // }));
  // console.log(inspect(arr.map(e => {
  //   return [e[0], e[1].length]
  // }), {
  //   depth: null,
  //   colorizeD: true
  // }));
  // console.log(inspect(quals, {
  //   depth: null,
  //   colorize: true
  // }));
  return str;
}
