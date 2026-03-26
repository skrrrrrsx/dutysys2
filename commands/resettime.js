const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resettime')
    .setDescription('reseteld a duty idot neki')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('user akinek resetelni akarod (ures az mindenki)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');

    if (target) {
     
      db.db.prepare(`
        DELETE FROM duty_sessions WHERE discord_id = ?
      `).run(target.id);

      await interaction.reply({
        content: `duty ido reseteles neki: <@${target.id}>.`,
        ephemeral: true
      });
    } else {
     
      db.db.prepare(`DELETE FROM duty_sessions`).run();

      await interaction.reply({
        content: 'reset duty ido **all users**.',
        ephemeral: true
      });
    }
  }
};
