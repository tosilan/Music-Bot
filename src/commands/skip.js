const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')  // コマンド名
    .setDescription('現在の曲をスキップします。'),  // コマンドの説明
  
  async execute(interaction) {  // コマンド実行時の処理
    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
  
    if (!channel) {  // ボイスチャネルにいない場合
      const embed = new EmbedBuilder()
        .setColor('#FF0000')  // 赤色
        .setTitle('エラー')
        .setDescription('曲をスキップするにはボイスチャネルに入っている必要があります。');
      
      return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  
    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);  // キューを取得
      
      if (!queue || !queue.songs.length) {  // キューが空の場合
        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('曲がありません')
          .setDescription('現在キューに再生中の曲がありません。');
        
        return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }

      await interaction.client.playerManager.distube.skip(channel);  // 曲をスキップ

      const embed = new EmbedBuilder()
        .setColor('#00FF00')  // 緑色
        .setTitle('曲をスキップしました')
        .setDescription('⏭ 現在の曲がスキップされました。');
      
      await interaction.reply({ embeds: [embed] });  // 成功メッセージを返す
    } catch (error) {
      console.error('スキップエラー:', error);  // エラーをコンソールに出力

      let embed;
      
      if (error instanceof DisTubeError) {  // DisTubeError の場合
        if (error.errorCode === 'NO_QUEUE') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('キューがありません')
            .setDescription('スキップするキューがありません。');
        } else if (error.errorCode === 'NO_UP_NEXT') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('次に再生する曲がありません')
            .setDescription('次にスキップする曲がありません。');
        } else {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('エラー')
            .setDescription('曲をスキップしようとしたときにエラーが発生しました。');
        }
      } else {
        embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('曲をスキップしようとしたときにエラーが発生しました。');
      }

      await interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  },
};
