const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');  // プレイリストモデルをインポート

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showallplaylists')  // コマンド名
    .setDescription('すべてのプレイリストを表示します。'),  // コマンドの説明
  
  async execute(interaction) {  // コマンド実行時の処理
    const playlists = await Playlist.find({
      name: { $exists: true },  // 名前が存在するプレイリストを取得
      userId: { $exists: true },  // ユーザーIDが存在するプレイリストを取得
      isPublic: { $exists: true },  // 公開状態が存在するプレイリストを取得
      songs: { $exists: true }  // 曲が存在するプレイリストを取得
    });

    if (playlists.length === 0) {  // プレイリストが見つからない場合
      return interaction.reply({ content: 'プレイリストが見つかりませんでした。', ephemeral: true });  // エラーメッセージを返す
    }

    const embeds = [];
    let currentEmbed = new EmbedBuilder()
      .setTitle('すべてのプレイリスト')
      .setColor('#0099ff');  // 青色

    playlists.forEach((pl, index) => {
      // 15曲ごとに新しい埋め込みを作成
      if (index % 15 === 0 && index !== 0) {
        embeds.push(currentEmbed);  // 現在の埋め込みを追加
        currentEmbed = new EmbedBuilder()
          .setTitle('すべてのプレイリスト (続き)')
          .setColor('#0099ff');  // 青色
      }

      // プレイリストの詳細を追加
      currentEmbed.addFields({
        name: `${pl.name} (${pl.isPublic ? '公開' : '非公開'})`,  // プレイリスト名と公開状態
        value: `ユーザー: <@${pl.userId}>, 曲数: ${pl.songs.length}`,  // ユーザーと曲数
      });
    });

    embeds.push(currentEmbed);  // 最後の埋め込みを追加

    // 埋め込みメッセージを返信
    for (const embed of embeds) {
      await interaction.reply({ embeds: [embed] });
    }
  },
};
