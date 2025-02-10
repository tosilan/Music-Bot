const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');  // プレイリストモデルをインポート

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewplaylist')  // コマンド名
    .setDescription('プレイリストの曲を表示します。')  // コマンドの説明
    .addStringOption(option => 
      option.setName('name')  // プレイリスト名のオプション
        .setDescription('プレイリストの名前。')
        .setRequired(true)),  // 必須オプション
  
  async execute(interaction) {  // コマンド実行時の処理
    const name = interaction.options.getString('name');  // プレイリスト名を取得
    const userId = interaction.user.id;  // ユーザーIDを取得

    const playlist = await Playlist.findOne({ name });  // プレイリストをデータベースから取得
    if (!playlist) {  // プレイリストが見つからない場合
      return interaction.reply({ content: 'プレイリストが見つかりませんでした。', ephemeral: true });  // エラーメッセージを返す
    }

    if (!playlist.isPublic && playlist.userId !== userId) {  // 非公開プレイリストかつユーザーが所有者でない場合
      return interaction.reply({ content: 'このプレイリストを表示する権限がありません。', ephemeral: true });  // エラーメッセージを返す
    }

    if (playlist.songs.length === 0) {  // 曲がない場合
      return interaction.reply({ content: 'このプレイリストには曲がありません。', ephemeral: true });  // メッセージを返す
    }

    const embed = new EmbedBuilder()
      .setTitle(`プレイリスト: ${playlist.name}`)  // 埋め込みメッセージのタイトル
      .setDescription(playlist.songs.join('\n'))  // 曲のリストを表示
      .setColor('#ff0000');  // 赤色

    await interaction.reply({ embeds: [embed] });  // プレイリストを含む埋め込みメッセージを返す
  },
};
