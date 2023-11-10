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

const N_COLS = 27;
const DATA_COL_START = 2;
const N_ROWS = 138;
const PILOT_ROW = 2;
const QUAL_COL = 1;
const QUAL_ROW_START = 4;

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
  
  const quals = [];
  for (let i = QUAL_ROW_START; i < N_ROWS; i++) {
    quals.push(sheet.getCell(i, QUAL_COL).value)
  }
  
  pilots.forEach(ent => ent !== '' && console.log(ent))
  quals.forEach(ent => console.log(ent))
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

      await doc.loadInfo(); // loads document properties and worksheets
      console.log(doc.title);
      const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
      console.log(sheet.title);
      const cells = await sheet.loadCells("A1:AA");
      const cell = sheet.getCell(3, 5);
      console.log(cell.value); // 'Larry Page'

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
