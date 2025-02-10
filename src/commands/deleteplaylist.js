const { SlashCommandBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteplaylist')
    .setDescription('プレイリストを削除します。')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('プレイリストの名前。')
        .setRequired(true)),
  
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const userId = interaction.user.id;

    const playlist = await Playlist.findOneAndDelete({ name, userId });
    if (!playlist) {
      return interaction.reply('プレイリストが見つからないか、削除する権限がありません。');
    }

    await interaction.reply(`プレイリスト **${name}** が削除されました。`);
  },
};
