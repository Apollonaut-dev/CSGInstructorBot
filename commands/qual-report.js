import { SlashCommandBuilder } from 'discord.js';

import * as BengalReport from '../data/qual-report-224.js';
import { modex_regex } from '../data/util.js';;

// const SquadronChannelMap = {
//   103: '676242923859214352',
//   14: '676244125363994625',
//   86: '676243960712265769',
//   224: '676242520484741150',
//   513: '938036587361615913',
//   126: '1102420287405961267'
// }

export const data = new SlashCommandBuilder()
  .setName("qual-report")
  .setDescription("Get qual report for present members");

export const execute = async (interaction) => {
  console.log('executing qual-report')
  
  const channel = await interaction.guild.channels.fetch('676242520484741150');
  const members = await channel.members;
  const nicknames = members.map(m => m.nickname ? m.nickname : m.user.username)
  // const nicknames = ['Apollo 403', 'Cyborg 402', 'Atorius 406', 'Rogue 456', '460', 'MIDN Jojo Clarke'];
  const present_modices = nicknames.map(p => Number(p.match(modex_regex)));
  console.log(members.map((m) => m.nickname ? m.nickname : m.user.username));
  
  // defer reply because report generation, connecting with google API often takes longer than 3 seconds
  await interaction.deferReply();
  const report = await BengalReport.generate(present_modices);
  await interaction.editReply(report);
};
