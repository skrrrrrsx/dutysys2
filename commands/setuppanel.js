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
    .setDescription('calm down g')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('szoba ahova bekuldod a cuccost')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Duty Panel')
      .setDescription(
        'Használd a gombot itt lent, hogy **elindítsd** vagy **leaállítsd** a dutyt!.\n\n' +
        '> Kattints a **Duty elindítása** gombra hogy elkezd a dutyt\n' +
        '> Kattints a **Duty befejezése** gombra hogy abbahagyd a dutyt\n\n' +
        'Duty sessionod automatan elsavel(talan)'
      )
      .setFooter({ text: 'Csak lazába' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_duty_toggle')
        .setLabel('Duty elindítása')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `Duty panel elkuldve itt: ${channel}.`,
      ephemeral: true,
    });
  },
};
