import { SlashCommandBuilder } from 'discord.js';

import * as BengalReport from '../data/qual-report-224.js';
// import * as JollyRogersReport from '../data/qual-report-103.js';
// import * as TophattersReport from '../data/qual-report-14.js';
// import * as SidewindersReport from '../data/qual-report-86.js';
// import * as NightmaresReport form '../data/qual-report-513.js';

import { modex_regex } from '../data/util.js';;

const SquadronReadyRoomVCChannelMap = {
  103: '676242923859214352',
  14: '676244125363994625',
  86: '676243960712265769',
  224: '676242520484741150',
  513: '938036587361615913'
}

const IPTextChannelSquadronMap = {
  ['741017122796339251']: 103,
  ['907489943218163742']: 14,
  ['616728259098443787']: 86,
  ['743379174588153958']: 224,
  ['951884830491152424']: 513
}

export const data = new SlashCommandBuilder()
  .setName("qual-report")
  .setDescription("Get qual report for present members")
  .addStringOption(option => {
    return option.setName('squadron')
      .setDescription('Squadron the bot will report for');
  });

export const execute = async (interaction) => {
  console.log('executing qual-report')
  
  
  // const command_channel = interaction.channel.id
  
  const squadron_arg = interaction.options.getString('squadron');
  
  // select VC based on argument
  if (squadron_arg && squadron_arg.length) {
  
  } 
  // select VC based on which IP channel the command was executed from
  else {
    switch(interaction.channel.channelId) {
        
    }
  }
  
  const ready_room_vc = await interaction.guild.channels.fetch('676242520484741150');
  
  
  const members = await ready_room_vc.members;
  
  if (members.length == 0) {
    return interaction.reply(`224 ready room is empty.`);
  }
  
  const nicknames = members.map(m => m.nickname ? m.nickname : m.user.username);

  const present_modices = nicknames.map(p => Number(p.match(modex_regex)));
  console.log(members.map((m) => m.nickname ? m.nickname : m.user.username));
  
  // defer reply because report generation, connecting with google API often takes longer than 3 seconds
  await interaction.deferReply();
  const report = await BengalReport.generate(present_modices);
  
  
  
  await interaction.editReply(report);
};
