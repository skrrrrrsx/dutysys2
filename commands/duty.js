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
    .setDescription('duty ki/be kapcsolasa'),

  async execute(interaction) {
    const discordId = interaction.user.id;
    const user = db.getUser(discordId);

    if (!user) {
      return interaction.reply({
        embeds: [errorEmbed('Nem vagy regisztrálva kérd meg trixet hogy csinálja meg')],
        ephemeral: true,
      });
    }

    const active = db.getActiveDuty(discordId);

    // ── Build confirmation button ────────────────────────────────────────────
    const action = active ? 'end' : 'start';
    const label = active ? 'Duty leállítása' : 'Duty elindítása';
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
      ? `Dutyba vagy ennyi ideje: **${formatTime(active.start_time)}**.\n nyomd meg a gombot, hogy leállítsd a dutyd..`
      : `Nem vagy dutyba.\nNyomd meg a gombot, hogy elindítsd a **dutyt**.`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(active ? 0xe74c3c : 0x2ecc71)
          .setTitle(active ? 'Jelenleg On Duty' : 'Jelenleg Off Duty')
          .setDescription(statusMsg)
          .addFields({ name: '👤 Roblox Username', value: user.roblox_username }),
      ],
      components: [row],
      ephemeral: true,
    });
  },
};
