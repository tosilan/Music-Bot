const { SlashCommandBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addsongtoplaylist')
    .setDescription('プレイリストに曲を追加します。')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('プレイリストの名前。')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('song')
        .setDescription('URLまたは曲の名前。')
        .setRequired(true)),
  
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const song = interaction.options.getString('song');
    const userId = interaction.user.id;

    const playlist = await Playlist.findOne({ name, userId });
    if (!playlist) {
      return interaction.reply('プレイリストが見つからないか、変更する権限がありません。');
    }

    playlist.songs.push(song);
    await playlist.save();

    await interaction.reply(`曲 **${song}** が **${name}** に追加されました。`);
  },
};
