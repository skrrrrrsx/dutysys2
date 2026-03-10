const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');
const { formatDuration, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dutystats')
    .setDescription('View duty statistics for yourself or another mod')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to check (leave blank for yourself)')
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = db.getUser(target.id);

    if (!user) {
      return interaction.reply({
        embeds: [errorEmbed(`<@${target.id}> is not registered in the system.`)],
        ephemeral: true,
      });
    }

    const stats = db.getStats(target.id);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📊 Duty Stats — ${user.roblox_username}`)
      .addFields(
        { name: '🔖 Discord', value: `<@${target.id}>`, inline: true },
        { name: '👤 Roblox', value: user.roblox_username, inline: true },
        { name: '🟢 Status', value: stats.active ? '**On Duty**' : 'Off Duty', inline: true },
        { name: '📋 Total Sessions', value: String(stats.sessions), inline: true },
        { name: '⏱️ Total Time', value: formatDuration(stats.totalSeconds) || '0s', inline: true },
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
