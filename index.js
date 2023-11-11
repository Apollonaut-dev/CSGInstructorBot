import "dotenv/config";

import { 
  Client,
  Collection,
  Events,
  GatewayIntentBits
} from "discord.js";

import fs from 'node:fs';
import path from 'node:path';


const client = new Client({ intents: [GatewayIntentBits.Guilds]});

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for const file of c











