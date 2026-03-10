const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setuppanel')
    .setDescription('Post the permanent duty panel in a channel (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to post the duty panel in')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🛡️ Duty Panel')
      .setDescription(
        'Use the button below to **start** or **stop** your duty shift.\n\n' +
        '> 🟢 Press **Go On Duty** to clock in\n' +
        '> 🔴 Press **Go Off Duty** to clock out\n\n' +
        'Your session will be automatically logged.'
      )
      .setFooter({ text: 'You must be registered to use this panel.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_duty_toggle')
        .setLabel('🟢 Go On Duty')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `✅ Duty panel posted in ${channel}.`,
      ephemeral: true,
    });
  },
};
