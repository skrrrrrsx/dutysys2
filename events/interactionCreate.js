const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const db = require('../utils/database');
const { dutyStartEmbed, dutyEndEmbed, errorEmbed, formatTime, formatDuration } = require('../utils/helpers');
require('dotenv').config();

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {

    // ── Slash commands ─────────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[CMD ERROR] ${interaction.commandName}:`, err);
        const msg = { embeds: [errorEmbed('Something went wrong. Please try again.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg).catch(() => {});
        } else {
          await interaction.reply(msg).catch(() => {});
        }
      }
      return;
    }

    if (!interaction.isButton()) return;

    const { customId, user } = interaction;

    // ── Cancel buttons ─────────────────────────────────────────────────────────
    if (customId === 'duty_cancel' || customId === 'duty_panel_cancel') {
      return interaction.update({ content: '❌ Cancelled.', embeds: [], components: [] });
    }

    // ── Panel button: shows a private prompt to the user who clicked ───────────
    if (customId === 'panel_duty_toggle') {
      const dbUser = db.getUser(user.id);

      if (!dbUser) {
        return interaction.reply({
          embeds: [errorEmbed('You are not registered. Ask an admin to register you first.')],
          ephemeral: true,
        });
      }

      const active = db.getActiveDuty(user.id);
      const action = active ? 'end' : 'start';
      const confirmLabel = active ? '🔴 End Duty' : '🟢 Start Duty';
      const confirmStyle = active ? ButtonStyle.Danger : ButtonStyle.Success;
      const statusText = active
        ? `You are currently **on duty** since **${formatTime(active.start_time)}**.\nClick below to **end** your shift.`
        : `You are currently **off duty**.\nClick below to **start** your shift.`;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`duty_confirm_${action}_${user.id}`)
          .setLabel(confirmLabel)
          .setStyle(confirmStyle),
        new ButtonBuilder()
          .setCustomId('duty_panel_cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

      // ephemeral = only the clicker sees this; the panel message is untouched
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(active ? 0xe74c3c : 0x2ecc71)
            .setTitle(active ? '🔴 You Are On Duty' : '⚪ You Are Off Duty')
            .setDescription(statusText)
            .addFields({ name: '👤 Roblox', value: dbUser.roblox_username, inline: true }),
        ],
        components: [row],
        ephemeral: true,
      });
    }

    // ── Confirm start/end ──────────────────────────────────────────────────────
    const match = customId.match(/^duty_confirm_(start|end)_(\d+)$/);
    if (!match) return;

    const [, action, targetId] = match;

    if (user.id !== targetId) {
      return interaction.reply({
        embeds: [errorEmbed('This button is not for you.')],
        ephemeral: true,
      });
    }

    const dbUser = db.getUser(targetId);
    if (!dbUser) {
      return interaction.update({ embeds: [errorEmbed('You are not registered.')], components: [] });
    }

    await interaction.deferUpdate();

    const logChannel = LOG_CHANNEL_ID
      ? await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null)
      : null;

    // ── Start duty ─────────────────────────────────────────────────────────────
    if (action === 'start') {
      const alreadyActive = db.getActiveDuty(targetId);
      if (alreadyActive) {
        return interaction.editReply({
          embeds: [errorEmbed('You already have an active duty session!')],
          components: [],
        });
      }

      const session = db.startDuty(targetId);

      if (logChannel) {
        const logMsg = await logChannel.send({ embeds: [dutyStartEmbed(dbUser.roblox_username, targetId, session)] }).catch(console.error);
        if (logMsg) db.saveLogMessageId(session.id, logMsg.id);
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('✅ Duty Started')
            .setDescription(`You are now **on duty** as **${dbUser.roblox_username}**. Stay safe! 🛡️`)
            .addFields({ name: '🕐 Started at', value: formatTime(session.start_time), inline: true }),
        ],
        components: [],
      });
    }

    // ── End duty ───────────────────────────────────────────────────────────────
    if (action === 'end') {
      const session = db.endDuty(targetId);
      if (!session) {
        return interaction.editReply({
          embeds: [errorEmbed('No active duty session found.')],
          components: [],
        });
      }

      if (logChannel) {
        await logChannel.send({ embeds: [dutyEndEmbed(dbUser.roblox_username, targetId, session)] }).catch(console.error);
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('✅ Duty Ended')
            .setDescription(`You are now **off duty**. Good work! 👋`)
            .addFields(
              { name: '🕐 Started', value: formatTime(session.start_time), inline: true },
              { name: '🕐 Ended', value: formatTime(session.end_time), inline: true },
              { name: '⏱️ Duration', value: formatDuration(session.end_time - session.start_time), inline: true },
            ),
        ],
        components: [],
      });
    }
  },
};
