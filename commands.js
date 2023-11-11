import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";



// Simple test command
const QUALS_COMMAND = {
  name: "qual-report",
  description: "Get list of quals the present members most need",
  type: 1,
};


const ALL_COMMANDS = [QUALS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
