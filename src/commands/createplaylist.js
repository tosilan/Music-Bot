const { SlashCommandBuilder } = require('discord.js');
const Playlist = require('../models/Playlist'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createplaylist')
    .setDescription('新しいプレイリストを作成します。')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('プレイリストの名前。')
        .setRequired(true))
    .addBooleanOption(option => 
      option.setName('public')
        .setDescription('プレイリストは公開ですか？')
        .setRequired(true)),
  
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const isPublic = interaction.options.getBoolean('public');
    const userId = interaction.user.id;

    const playlist = new Playlist({ userId, name, isPublic });
    await playlist.save();

    await interaction.reply(`プレイリスト **${name}** が作成されました。`);
  },
};
