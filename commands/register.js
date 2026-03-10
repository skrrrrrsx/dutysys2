const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('discord/roblox acc link')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('user').setDescription('a discord user amit regisztralni akarsz').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('roblox').setDescription('a roblox neve').setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const roblox = interaction.options.getString('roblox').trim();

    if (!roblox) {
      return interaction.reply({ embeds: [errorEmbed('roblox user nem lehet üres.')], ephemeral: true });
    }

    db.registerUser(target.id, roblox);

    return interaction.reply({
      embeds: [successEmbed(`Registered <@${target.id}> as **${roblox}**.`)],
      ephemeral: true,
    });
  },
};
