const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Link a Discord user to their Roblox username')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('user').setDescription('The Discord user to register').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('roblox').setDescription('Their Roblox username').setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const roblox = interaction.options.getString('roblox').trim();

    if (!roblox) {
      return interaction.reply({ embeds: [errorEmbed('Roblox username cannot be empty.')], ephemeral: true });
    }

    db.registerUser(target.id, roblox);

    return interaction.reply({
      embeds: [successEmbed(`Registered <@${target.id}> as **${roblox}**.`)],
      ephemeral: true,
    });
  },
};
