import { SlashCommandBuilder } from 'discord.js';

// import * as JollyRogersReport from '../data/qual-report-103.js';
import * as TophattersReport from '../data/qual-report-14.js';
// import * as SidewindersReport from '../data/qual-report-86.js';
import * as BengalsReport from '../data/qual-report-224.js';
// import * as NightmaresReport form '../data/qual-report-513.js';

import { modex_regex } from '../data/util.js';;

// Squadrons to VC ready rooms
const SquadronReadyRoomVCChannelMap = {
  ['103']: '676242923859214352',
  ['14']: '676244125363994625',
  ['86']: '676243960712265769',
  ['224']: '676242520484741150',
  ['513']: '938036587361615913'
}

// IP text channels to squadrons
const IPTextChannelSquadronMap = {
  ['741017122796339251']: '103',
  ['907489943218163742']: '14',
  ['616728259098443787']: '86',
  ['743379174588153958']: '224',
  ['951884830491152424']: '513'
}

export const data = new SlashCommandBuilder()
  .setName("quals")
  .setDescription("Get qual report for present members")
  .addStringOption(option => {
    return option.setName('squadron')
      .setDescription('Squadron the bot will report for');
  });

export const execute = async (interaction) => {
  const squadron_arg = interaction.options.getString('squadron');
  
  // if command argument was included, attempt to get squadron data based on argument
  // if not, infer squadron from the IP channel it was sent from
  let selected_squadron;
  if (squadron_arg && squadron_arg.length && squadron_arg in SquadronReadyRoomVCChannelMap) {
    selected_squadron = squadron_arg
  } else if (IPTextChannelSquadronMap[interaction.channel.channelId]) {
    selected_squadron = IPTextChannelSquadronMap[interaction.channel.channelId]
  } else {
    // error -- can't resolve squadron
    return interaction.reply("Error: can't resolve squadron");
  }
  console.log(`Attempting to generate report for ${selected_squadron}`);
  
  const selected_ready_room = SquadronReadyRoomVCChannelMap[selected_squadron];
  let ready_room_vc;
  try {
    ready_room_vc = await interaction.guild.channels.fetch(selected_ready_room);
  } catch (error) {
    console.log(error);
    interaction.reply('Error resolving voice channel.');
    return;
  }
  
  // get members currently connected to voice channel ready room
  const members = ready_room_vc.members;
  if (members.size == 0) {
    return interaction.reply(`${selected_squadron} ready room is empty.`);
  }
  
  // map members to nicknames to modices
  const nicknames = members.map(m => m.nickname ? m.nickname : m.user.username);
  const present_modices = nicknames.map(p => Number(p.match(modex_regex)));
  console.log(members.map((m) => m.nickname ? m.nickname : m.user.username));
  
  // defer reply because report generation, connecting with google API often takes longer than 3 seconds hence this is required per Discord API documentation
  await interaction.deferReply();
  let report;
  switch (selected_squadron) {
    // case '103':
    //   report = await JollyRogers.generate(present_modices);
    //   break;
    case '14':
      report = await TophattersReport.generate(present_modices);
      break;
    // case '86':
    //   report = await SidewindersReport.generate(present_modices);
    //   break;
    case '224':
      report = await BengalsReport.generate(present_modices);
      break;
    // case '513':
    //   report = await NightmaresReport.generate(present_modices);
    //   break;
    default:
      console.log(`Error: No report handler for selected squadron ${selected_squadron}`);
      interaction.editReply(`Error: No report handler for selected squadron ${selected_squadron}`);
      return;
  }
  
  await interaction.editReply(report);
};
