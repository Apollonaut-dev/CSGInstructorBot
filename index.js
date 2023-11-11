import "dotenv/config";

import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Hello world");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

(async function () {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.error(
        `[WARNING] The command at ${filePath} is missing required field ${
          "data" in command ? "data" : "execute"
        }`
      );
    }
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  console.log("handling interaction");
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `There was an error while executing this command!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `There was error while executing this command!`,
        ephemeral: true,
      });
    }
  }
});
