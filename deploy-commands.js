import "dotenv/config";

import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

(async function () {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.error(
        `[WARNING] The command at ${filePath} is missing required field ${
          "data" in command ? "data" : "execute"
        }`
      );
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = await rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID), { body: commands })
  } catch (error) {
    console.error(error);
  }
})();
