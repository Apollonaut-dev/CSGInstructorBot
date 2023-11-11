import { SlashCommandBuilder } from "discord.js";

// export default {
//   data: new SlashCommandBuilder().setName('qual-report').setDescription('Get qual report for present members'),
//   execute:  async (interaction) => {
//     await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}\nThis server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
//   }

export const data = new SlashCommandBuilder()
  .setName("qual-report")
  .setDescription("Get qual report for present members");
export const execute = async (interaction) => {
  await interaction.reply(
    `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}\nThis server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
  );
};
