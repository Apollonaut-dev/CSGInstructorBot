import { SlashCommandBuilder } from 'discord.js';

import * as BengalReport from '../data/qual-report-224.js';

import { modex_regex } from '../data/util.js';;

// regex to extract modices from pilot name strings -- just grabs digits at the end of the string, between 2 and 3
// const modex_regex = /\d{2,3}$/gm;

// (async function() {
//   const modex_regex = /\d{2,3}$/gm;
//   const present_modices = ['Apollo 403', 'Cyborg 402', 'Atorius 406', 'Rogue 456', '460', 'MIDN Jojo Clarke'].map(p => Number(p.match(modex_regex)));
//   const report = await BengalReport.generate(present_modices);
//   console.log(report);
// })();

const SquadronChannelMap = {
  103: '0',
  14: '0',
  86: '0',
  224: '0',
  513: '0',
  126: '0'
}

export const data = new SlashCommandBuilder()
  .setName("qual-report")
  .setDescription("Get qual report for present members");

export const execute = async (interaction) => {
  console.log('executing qual-report')
  
  
  const channel = await interaction.guild.channels.fetch('1172378718853935138');
  const members = await channel.members;
  // const nicknames = members.map(m => m.nickname ? m.nickname : m.user.username)
  const nicknames = ['Apollo 403', 'Cyborg 402', 'Atorius 406', 'Rogue 456', '460', 'MIDN Jojo Clarke'];
  const present_modices = nicknames.map(p => Number(p.match(modex_regex)));
  console.log(members.map((m) => m.nickname ? m.nickname : m.user.username));
  
  // defer reply because report generation, connecting with google API often takes longer than 3 seconds
  await interaction.deferReply();
  const report = await BengalReport.generate(present_modices);
  await interaction.editReply(report);
};
