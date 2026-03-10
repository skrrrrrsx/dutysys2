const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const db = require('../utils/database');
const { dutyStartEmbed, dutyEndEmbed, errorEmbed, formatTime, formatDate, formatDuration } = require('../utils/helpers');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duty')
    .setDescription('Toggle your duty status on/off'),

  async execute(interaction) {
    const discordId = interaction.user.id;
    const user = db.getUser(discordId);

    if (!user) {
      return interaction.reply({
        embeds: [errorEmbed('You are not registered. Ask an admin to run `/register` for you first.')],
        ephemeral: true,
      });
    }

    const active = db.getActiveDuty(discordId);

    // ── Build confirmation button ────────────────────────────────────────────
    const action = active ? 'end' : 'start';
    const label = active ? '🔴 End Duty' : '🟢 Start Duty';
    const style = active ? ButtonStyle.Danger : ButtonStyle.Success;

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`duty_confirm_${action}_${discordId}`)
      .setLabel(label)
      .setStyle(style);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('duty_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    const statusMsg = active
      ? `You are currently **on duty** since **${formatTime(active.start_time)}**.\nPress the button to **end** your duty.`
      : `You are currently **off duty**.\nPress the button to **start** your duty.`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(active ? 0xe74c3c : 0x2ecc71)
          .setTitle(active ? '🔴 Currently On Duty' : '⚪ Currently Off Duty')
          .setDescription(statusMsg)
          .addFields({ name: '👤 Roblox Username', value: user.roblox_username }),
      ],
      components: [row],
      ephemeral: true,
    });
  },
};
