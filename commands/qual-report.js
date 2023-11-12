import { SlashCommandBuilder } from "discord.js";

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
  
  await interaction.reply(
    `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}\nThis server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
  );
};
