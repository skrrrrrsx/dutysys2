const { EmbedBuilder } = require('discord.js');

/**
 * Format seconds into a human-readable duration string.
 * e.g. 3661 → "1h 1m 1s"
 */
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  return parts.join(' ');
}

/**
 * Format a Unix timestamp to HH:MM (24h)
 */
function formatTime(unixSeconds) {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Budapest',
  });
}

/**
 * Format a Unix timestamp to MM.DD
 */
function formatDate(unixSeconds) {
  const date = new Date(unixSeconds * 1000);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}.${d}`;
}

// ─── Embed builders ──────────────────────────────────────────────────────────

function dutyStartEmbed(robloxUsername, discordId, session) {
  return new EmbedBuilder()
    .setColor(0x2ecc71) // green
    .setTitle('🟢 Duty Started')
    .addFields(
      { name: '👤 Roblox', value: robloxUsername, inline: true },
      { name: '🔖 Discord', value: `<@${discordId}>`, inline: true },
      { name: '📅 Date', value: formatDate(session.start_time), inline: true },
      { name: '🕐 Start', value: formatTime(session.start_time), inline: true },
      { name: '🕐 End', value: '—', inline: true },
      { name: '⏱️ Duration', value: '—', inline: true },
    )
    .setFooter({ text: `Session #${session.id}` })
    .setTimestamp(session.start_time * 1000);
}

function dutyEndEmbed(robloxUsername, discordId, session) {
  const duration = session.end_time - session.start_time;
  return new EmbedBuilder()
    .setColor(0xe74c3c) // red
    .setTitle('🔴 Duty Ended')
    .addFields(
      { name: '👤 Roblox', value: robloxUsername, inline: true },
      { name: '🔖 Discord', value: `<@${discordId}>`, inline: true },
      { name: '📅 Date', value: formatDate(session.start_time), inline: true },
      { name: '🕐 Start', value: formatTime(session.start_time), inline: true },
      { name: '🕐 End', value: formatTime(session.end_time), inline: true },
      { name: '⏱️ Duration', value: formatDuration(duration), inline: true },
    )
    .setFooter({ text: `Session #${session.id}` })
    .setTimestamp(session.end_time * 1000);
}

function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(0xe67e22)
    .setDescription(`⚠️ ${message}`);
}

function successEmbed(message) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setDescription(`✅ ${message}`);
}

module.exports = {
  formatDuration,
  formatTime,
  formatDate,
  dutyStartEmbed,
  dutyEndEmbed,
  errorEmbed,
  successEmbed,
};
