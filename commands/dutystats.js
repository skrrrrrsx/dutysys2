const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');
const { formatDuration, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dutystats')
    .setDescription('nezd meg a sajat vagy masok duty statjat')
    .addUserOption(opt =>
      opt.setName('user').setDescription('a modi neve(hagyd üresen ha a sajátodat akarod)')
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = db.getUser(target.id);

    if (!user) {
      return interaction.reply({
        embeds: [errorEmbed(`<@${target.id}> nincs bent a rendszerbe.`)],
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
        { name: '🟢 Jelenlegi status', value: stats.active ? '**On Duty**' : 'Off Duty', inline: true },
        { name: '📋 Totál sessions', value: String(stats.sessions), inline: true },
        { name: '⏱️ Totál idő', value: formatDuration(stats.totalSeconds) || '0s', inline: true },
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
