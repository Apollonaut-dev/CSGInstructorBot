import { SlashCommandBuilder } from 'discord.js';

import * as BengalReport from '../data/qual-report-224.js';

(async function() {
  const report = await BengalReport.generate(['Apollo 403', 'Cyborg 402', 'Atorius 406', 'Rogue 456', '460']);
  console.log(report);
})();

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
  
  // const channel = interaction.guild.channels.cache.find(c => c.id == 1172378718853935138)
  // const chan = await channel.fetch()
  // const members = chan.members
  // console.log(members.map(m => m.nickname ? m.nickname : m.user.username));
  
  // const guild = await interaction.guild.fetch()
  // const channels = await guild.channels.fetch()
  const channel = await interaction.guild.channels.fetch('1172378718853935138');
  const members = await channel.members;
  console.log(members.map((m) => m.nickname ? m.nickname : m.user.username));
  
  const pilots = 
  // defer reply because report generation, connecting with google API often takes longer than 3 seconds
  await interaction.deferReply();
  const report = await BengalReport.generate(['Apollo 403', 'Cyborg 402', 'Atorius 406', 'Rogue 456', '460']);
  await interaction.editReply(report);
};
