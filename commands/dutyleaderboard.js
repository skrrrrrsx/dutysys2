const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const { formatDuration } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dutyleaderboard')
    .setDescription('Show the top moderators by total duty time'),

  async execute(interaction) {
    const rows = db.getLeaderboard(10);

    if (!rows.length) {
      return interaction.reply({ content: 'No duty data yet.', ephemeral: true });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const lines = rows.map((row, i) => {
      const medal = medals[i] || `**${i + 1}.**`;
      const time = formatDuration(row.total_seconds) || '0s';
      return `${medal} **${row.roblox_username}** (<@${row.discord_id}>) — ${time} (${row.sessions} sessions)`;
    });

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('🏆 Duty Leaderboard')
      .setDescription(lines.join('\n'))
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
