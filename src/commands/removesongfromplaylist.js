const { SlashCommandBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');  // プレイリストモデルをインポート

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removesongfromplaylist')  // コマンド名
    .setDescription('プレイリストから曲を削除します。')  // コマンドの説明
    .addStringOption(option => 
      option.setName('name')  // プレイリスト名のオプション
        .setDescription('プレイリストの名前。')
        .setRequired(true))  // 必須オプション
    .addStringOption(option => 
      option.setName('song')  // 曲のオプション
        .setDescription('曲のURLまたは名前。')
        .setRequired(true)),  // 必須オプション
  
  async execute(interaction) {  // コマンド実行時の処理
    const name = interaction.options.getString('name');  // プレイリスト名を取得
    const song = interaction.options.getString('song');  // 曲を取得
    const userId = interaction.user.id;  // ユーザーIDを取得

    const playlist = await Playlist.findOne({ name, userId });  // プレイリストをデータベースから取得
    if (!playlist) {
      return interaction.reply('プレイリストが見つからないか、変更する権限がありません。');  // エラーメッセージを返す
    }

    playlist.songs = playlist.songs.filter(s => s !== song);  // 曲を削除
    await playlist.save();  // プレイリストを保存

    await interaction.reply(`曲 **${song}** が **${name}** から削除されました。`);  // 成功メッセージを返す
  },
};
