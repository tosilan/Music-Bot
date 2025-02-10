const { SlashCommandBuilder } = require('discord.js');
const Playlist = require('../models/Playlist');  // プレイリストモデルをインポート
const ytSearch = require('yt-search');  // YouTube 検索パッケージをインポート

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playcustomplaylist')  // コマンド名
    .setDescription('あなたのカスタムプレイリストを再生します。')  // コマンドの説明
    .addStringOption(option => 
      option.setName('name')  // プレイリスト名のオプション
        .setDescription('プレイリストの名前。')
        .setRequired(true)),  // 必須オプション

  async execute(interaction) {  // コマンド実行時の処理
    const name = interaction.options.getString('name');  // プレイリスト名を取得
    const userId = interaction.user.id;  // ユーザーIDを取得

    const playlist = await Playlist.findOne({ name, userId });  // プレイリストをデータベースから取得
    if (!playlist) {
      return interaction.reply('プレイリストが見つからないか、再生する権限がありません。');
    }

    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
    if (!channel) {
      return interaction.reply('音楽を再生するにはボイスチャネルに入っている必要があります。');
    }

    await interaction.deferReply();  // 応答を遅延させる

    const songs = playlist.songs;  // プレイリスト内の曲を取得
    const videoUrls = [];  // 曲のURLを格納する配列

    // プレイリスト内の各曲のURLを取得
    for (const song of songs) {
      const searchResult = await ytSearch(song);  // 曲を検索
      if (searchResult && searchResult.videos.length > 0) {
        videoUrls.push(searchResult.videos[0].url);  // 最初の動画のURLを追加
      }
    }

    if (videoUrls.length === 0) {
      return interaction.followUp('プレイリストに曲が見つかりませんでした。');
    }

    try {
      // 最初の曲を即座に再生
      await interaction.client.playerManager.distube.play(channel, videoUrls[0], {
        member: interaction.member,
        textChannel: interaction.channel,
        skip: true,
      });

      // 残りの曲をキューに追加
      for (let i = 1; i < videoUrls.length; i++) {
        await interaction.client.playerManager.distube.play(channel, videoUrls[i], {
          member: interaction.member,
          textChannel: interaction.channel,
          skip: false,
        });
      }

      await interaction.followUp(`プレイリスト **${name}** を再生中です。`);
    } catch (error) {
      console.error('再生エラー:', error);
      await interaction.followUp('プレイリストの再生中にエラーが発生しました。');
    }
  },
};
