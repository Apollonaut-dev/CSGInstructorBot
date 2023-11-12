import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
} from "./utils.js";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const serviceAccountAuth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

const doc = new GoogleSpreadsheet(
  "1G58gg-BKW-fpYPudBMDZztFism5FJ_OME9kvzvjxm2w",
  serviceAccountAuth
);

const N_ROWS = 138;
const N_COLS = 27;

const DATA_ROW_START = 4;
const DATA_COL_START = 2;

const PILOT_ROW = 2;
const QUAL_COL = 1;

const NON_DATA_ROWS = [
  13, 17, 20, 26, 35, 44, 45, 50, 59, 65, 70, 75, 82, 90, 122,
];

const IQT_START = 4;
const MCQ_START = 17;
const CQ_START = 35;
const CMQ_START = 44;
const SUPPLEMENTAL_START = 90;

const present_pilots = [
  'Maj "Apollo" Dev (AOPS) 403',
  "412",
  "454",
  "455",
  "456",
  "400",
  "401",
  "402",
  "404",
  "405",
  "406",
  "407",
  "410",
  "411",
  "414",
  "415",
  "416",
  "417",
  "450",
  "451",
  "452",
  "453",
  "456",
  "457",
  "460",
];
const modex_regex = /\d{2,3}$/gm;
const present_modices = present_pilots.map((pilot) =>
  Number(pilot.match(modex_regex))
);

(async function () {
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  console.log(sheet.title);
  const cells = await sheet.loadCells("A1:AA");
  const cell = sheet.getCell(3, 5);

  const pilots = [];
  for (let i = DATA_COL_START; i < N_COLS; i++) {
    pilots.push(sheet.getCell(PILOT_ROW, i).value.trim());
  }

  const qual_count_map = {};
  let active_count_map;
  const IQT_qual_count_map = {};
  const MCQ_qual_count_map = {};
  const CQ_qual_count_map = {};
  const CMQ_qual_count_map = {};
  const supplemental_qual_count_map = {};

  let cell_value;
  const quals = [];
  // loop variables
  let qual;
  let pilot_str;
  let pilot_modex;

  const needs_IQT = [];
  for (let i = IQT_START; i < MCQ_START; i++) {
    if (NON_DATA_ROWS.includes(i)) continue;
    qual = sheet.getCell(i, QUAL_COL).value;

    quals.push(qual);
    IQT_qual_count_map[qual] = { count: 0, pilots: [] };

    for (let j = DATA_COL_START; j < N_COLS; j++) {
      pilot_str = sheet.getCell(PILOT_ROW, j).value;
      pilot_modex = Number(pilot_str.match(modex_regex));
      if (!present_modices.includes(pilot_modex)) continue;

      cell_value = sheet.getCell(i, j).value;
      if (cell_value == "NOGO") {
        if (!needs_IQT.includes(pilot_modex)) needs_IQT.push(pilot_modex);

        IQT_qual_count_map[qual].count += 1;
        IQT_qual_count_map[qual].pilots.push(pilot_str);
      }
    }
  }

  const needs_MCQ = [];
  for (let i = MCQ_START; i < CQ_START; i++) {
    if (NON_DATA_ROWS.includes(i)) continue;
    qual = sheet.getCell(i, QUAL_COL).value;

    quals.push(qual);
    MCQ_qual_count_map[qual] = { count: 0, pilots: [] };

    for (let j = DATA_COL_START; j < N_COLS; j++) {
      pilot_str = sheet.getCell(PILOT_ROW, j).value;
      pilot_modex = Number(pilot_str.match(modex_regex));
      if (!present_modices.includes(pilot_modex)) continue;
      if (needs_IQT.includes(pilot_modex)) continue;

      cell_value = sheet.getCell(i, j).value;
      if (cell_value == "NOGO") {
        if (!needs_MCQ.includes(pilot_modex)) needs_MCQ.push(pilot_modex);
        MCQ_qual_count_map[qual].count += 1;
        MCQ_qual_count_map[qual].pilots.push(pilot_str);
      }
    }
  }

  const needs_CMQ = [];
  for (let i = CMQ_START; i < SUPPLEMENTAL_START; i++) {
    if (NON_DATA_ROWS.includes(i)) continue;
    qual = sheet.getCell(i, QUAL_COL).value;

    quals.push(qual);
    CMQ_qual_count_map[qual] = { count: 0, pilots: [] };

    for (let j = DATA_COL_START; j < N_COLS; j++) {
      pilot_str = sheet.getCell(PILOT_ROW, j).value;
      pilot_modex = Number(pilot_str.match(modex_regex));
      if (!present_modices.includes(pilot_modex)) continue;
      if (needs_IQT.includes(pilot_modex)) continue;
      if (needs_MCQ.includes(pilot_modex)) continue;

      cell_value = sheet.getCell(i, j).value;
      if (cell_value == "NOGO") {
        if (!needs_CMQ.includes(pilot_modex)) needs_MCQ.push(pilot_modex);
        CMQ_qual_count_map[qual].count += 1;
        CMQ_qual_count_map[qual].pilots.push(pilot_str);
      }
    }
  }

  for (let i = SUPPLEMENTAL_START; i < N_ROWS; i++) {
    if (NON_DATA_ROWS.includes(i)) continue;
    qual = sheet.getCell(i, QUAL_COL).value;

    quals.push(qual);
    supplemental_qual_count_map[qual] = { count: 0, pilots: [] };

    for (let j = DATA_COL_START; j < N_COLS; j++) {
      pilot_str = sheet.getCell(PILOT_ROW, j).value;
      pilot_modex = Number(pilot_str.match(modex_regex));
      if (!present_modices.includes(pilot_modex)) continue;

      cell_value = sheet.getCell(i, j).value;
      if (cell_value == "NOGO") {
        supplemental_qual_count_map[qual].count += 1;
        supplemental_qual_count_map[qual].pilots.push(pilot_str);
      }
    }
  }

  const qual_report_comparator = (a, b) => {
    if (a.count > b.count) {
      return -1;
    } else if (a.cont < b.count) {
      return 1;
    }
    return 0;
  };
  // temp placeholder array
  let array;
  let report_string = "<<<<<<< BENGALS TRAINING REPORT >>>>>>>\n\n";
  // IQT handling
  // tbh I think it is sufficient to report IQT checkrides only
  report_string += "======= IQT Report =======\n";
  const IQT_checkride = IQT_qual_count_map["IQT Check Ride"];
  report_string += `IQT checkride: ${
    IQT_checkride.count
  }\n\t${IQT_checkride.pilots.join(", ")}\n`;
  // IQT breakdown ommitted but it would be similar to the following two for...loops

  // MCQ checkrides
  const MCQ_checkride_day = MCQ_qual_count_map["MCQ Check Ride (Day IFR)"];
  const MCQ_checkride_night = MCQ_qual_count_map["MCQ Check Ride (Night)"];
  report_string += "\n======= MCQ Report =======\n";
  report_string += `MCQ Checkride (Day IFR): ${
    MCQ_checkride_day.count
  }\n\t${MCQ_checkride_day.pilots.join(", ")}\n`;
  report_string += `MCQ Checkride (Night): ${
    MCQ_checkride_night.count
  }\n\t${MCQ_checkride_night.pilots.join(", ")}\n`;

  array = [];
  for (const [qual, datum] of Object.entries(MCQ_qual_count_map)) {
    if (qual === null) continue;
    if (datum.count == 0) continue;
    array.push({
      qual: qual,
      count: datum.count,
      pilots: datum.pilots,
    });
  }
  let sorted = array.sort(qual_report_comparator);
  let entry;
  for (let i = 0; i < Math.min(sorted.length, 5); i++) {
    entry = sorted[i];
    report_string += `\t${entry.qual}\n\t${
      entry.count
    } -- Eligible: \t${entry.pilots.join(", ")}\n`;
  }

  // CMQ
  report_string += "\n======= CMQ Report =======\n";

  array = [];
  for (const [qual, datum] of Object.entries(CMQ_qual_count_map)) {
    if (qual === null) continue;
    if (datum.count == 0) continue;
    array.push({
      qual: qual,
      count: datum.count,
      pilots: datum.pilots,
    });
  }
  sorted = array.sort(qual_report_comparator);
  for (let i = 0; i < Math.min(sorted.length, 5); i++) {
    entry = sorted[i];
    report_string += `\t${entry.qual}\n\t${
      entry.count
    } -- Eligible: \t${entry.pilots.join(", ")}\n`;
  }

  // Supplemental
  report_string += "\n======= Supplementals =======\n";

  array = [];
  for (const [qual, datum] of Object.entries(supplemental_qual_count_map)) {
    if (qual === null) continue;
    if (datum.count == 0) continue;
    array.push({
      qual: qual,
      count: datum.count,
      pilots: datum.pilots,
    });
  }
  sorted = array.sort(qual_report_comparator);
  for (let i = 0; i < Math.min(sorted.length, 5); i++) {
    entry = sorted[i];
    report_string += `\t${entry.qual}\n\t${
      entry.count
    } -- Eligible: \t${entry.pilots.join(", ")}\n`;
  }

  // console.log(report_string);
})();

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === "quals") {
      // Send a message into the channel where command was triggered from

      // const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      // const endpoint = `https://discord.com/api/${process.env.APP_ID}/channels/1172378718853935138/thread-members`;
      // const endpoint = `https://therapeutic-discovered-geese.glitch.me/channels/1172378718853935138/thread-members`;
      const endpoint = `/?client_id=1172375350408396851&permissions=1024&scope=bot/channels/1172378718853935138/thread-members`;
      try {
        let variable = await DiscordRequest(endpoint, { method: 'GET'});
        console.log('variable: ');
        console.log(variable);
      } catch (err) {
        console.error("Error getting member list");
        console.error(err)
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: "hello world",
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});