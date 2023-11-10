import "dotenv/config";
import { capitalize, InstallGlobalCommands } from "./utils.js";

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const QUALS_COMMAND = {
  name: "quals",
  description: "Get list of quals the present members most need",
  type: 1,
};


const ALL_COMMANDS = [QUALS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
