import { SlashCommandBuilder } from 'discord.js';

import * as BengalReport from '../data/qual-report-224.js';

const SquadronChannelMap = {
  103: '0',
  14: '0',
  86: '0',
  224: '0',
  513: '0',
  126: '0'
}

console.log(BengalReport.generate(['Apollo 403']));

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
  
  // defer reply because report generation, con
  await interaction.deferReply();
  const report = await BengalReport.generate(['Apollo 403']);
  await interaction.editReply(report);
  
  // await interaction.reply(
  //   `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}\nThis server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
  // );
};
