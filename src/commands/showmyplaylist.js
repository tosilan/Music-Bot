const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');  // プレイリストモデルをインポート

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showmyplaylist')  // コマンド名
    .setDescription('あなたのプレイリストを表示します。'),  // コマンドの説明
  
  async execute(interaction) {  // コマンド実行時の処理
    const userId = interaction.user.id;  // ユーザーIDを取得
    const playlists = await Playlist.find({ userId });  // ユーザーのプレイリストを取得

    const embed = new EmbedBuilder()
      .setTitle('あなたのプレイリスト')  // 埋め込みメッセージのタイトル
      .setColor('#00ff00');  // 緑色

    playlists.forEach(pl => {
      embed.addFields({
        name: `${pl.name} (${pl.isPublic ? '公開' : '非公開'})`,  // プレイリスト名と公開状態
        value: `曲数: ${pl.songs.length}`,  // 曲数
      });
    });

    await interaction.reply({ embeds: [embed] });  // 埋め込みメッセージを返信
  },
};
