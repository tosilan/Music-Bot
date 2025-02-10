const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')  // コマンド名
    .setDescription('一時停止された曲を再開します。'),  // コマンドの説明

  async execute(interaction) {  // コマンド実行時の処理
    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得

    if (!channel) {  // ボイスチャネルにいない場合
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')  // 赤色
        .setTitle('エラー')
        .setDescription('❌ 音楽を再開するにはボイスチャネルに入っている必要があります。')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });  // エラーメッセージを返す
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);  // キューを取得

      if (!queue) {  // キューが存在しない場合
        const noQueueEmbed = new EmbedBuilder()
          .setColor('#ff9900')  // オレンジ色
          .setTitle('エラー')
          .setDescription('❌ 現在再開する音楽がありません。')
          .setTimestamp();

        return interaction.reply({ embeds: [noQueueEmbed], ephemeral: true });  // エラーメッセージを返す
      }

      if (!queue.paused) {  // 曲が一時停止していない場合
        const alreadyPlayingEmbed = new EmbedBuilder()
          .setColor('#ff9900')  // オレンジ色
          .setTitle('音楽はすでに再生中')
          .setDescription('▶️ 音楽はすでに再生されています。')
          .setTimestamp();

        return interaction.reply({ embeds: [alreadyPlayingEmbed], ephemeral: true });  // メッセージを返す
      }

      await interaction.client.playerManager.distube.resume(channel);  // 曲を再開

      const resumedEmbed = new EmbedBuilder()
        .setColor('#00ff00')  // 緑色
        .setTitle('音楽が再開されました')
        .setDescription('▶️ 曲が再開されました。')
        .setTimestamp();

      await interaction.reply({ embeds: [resumedEmbed] });  // 成功メッセージを返す

    } catch (error) {
      console.error('再開エラー:', error);  // エラーをコンソールに出力

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')  // 赤色
        .setTitle('エラー')
        .setDescription('❌ 曲を再開しようとしたときにエラーが発生しました。')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });  // エラーメッセージを返す
    }
  },
};
