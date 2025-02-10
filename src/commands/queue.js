const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')  // コマンド名
    .setDescription('現在のキューを取得します。'),  // コマンドの説明

  async execute(interaction) {  // コマンド実行時の処理
    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得

    if (!channel) {  // ボイスチャネルにいない場合
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')  // 赤色
        .setTitle('エラー')
        .setDescription('❌ 音楽キューを取得するにはボイスチャネルに入っている必要があります。')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });  // エラーメッセージを返す
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);  // キューを取得

      if (!queue || !queue.songs.length) {  // キューが空の場合
        const emptyQueueEmbed = new EmbedBuilder()
          .setColor('#ff9900')  // オレンジ色
          .setTitle('キュー')
          .setDescription('現在、キューは空です。')
          .setTimestamp();

        return interaction.reply({ embeds: [emptyQueueEmbed], ephemeral: true });  // 空のキューのメッセージを返す
      }

      const songs = queue.songs;  // 曲のリストを取得
      const embeds = [];  // 埋め込みメッセージ用の配列

      // 曲を10曲ずつ分けて埋め込みメッセージを作成
      for (let i = 0; i < songs.length; i += 10) {
        const current = songs.slice(i, i + 10);  // 現在の曲のスライスを取得
        const songList = current.map((song, index) => {
          const isCurrent = i + index === 0;  // 現在再生中の曲かどうかを判断
          return `${isCurrent ? '** ❤️‍🔥 **' : ''}${i + index + 1}. ${song.name} - \`${song.formattedDuration}\`${isCurrent ? '** (現在再生中)**' : ''}`;
        }).join('\n');  // 曲のリストを作成

        const embed = new EmbedBuilder()
          .setColor('#00ff00')  // 緑色
          .setTitle('現在のキュー')
          .setDescription(songList)  // 曲リストを埋め込む
          .setTimestamp();

        embeds.push(embed);  // 埋め込みメッセージを配列に追加
      }

      // 埋め込みメッセージを返信
      for (const embed of embeds) {
        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('キューの取得エラー:', error);  // エラーをコンソールに出力

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')  // 赤色
        .setTitle('エラー')
        .setDescription('❌ キューを取得中にエラーが発生しました。')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });  // エラーメッセージを返す
    }
  },
};
