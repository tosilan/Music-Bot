const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')  // コマンド名
    .setDescription('音楽を停止し、キューをクリアします。'),  // コマンドの説明
  
  async execute(interaction) {  // コマンド実行時の処理
    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
  
    if (!channel) {  // ボイスチャネルにいない場合
      const embed = new EmbedBuilder()
        .setColor('#FF0000')  // 赤色
        .setTitle('エラー')
        .setDescription('音楽を停止するにはボイスチャネルに入っている必要があります。');
      
      return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  
    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);  // キューを取得
      
      if (!queue || !queue.songs.length) {  // キューが空の場合
        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('キューがありません')
          .setDescription('再生中の音楽がないか、キューが空です。');
        
        return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }

      await interaction.client.playerManager.distube.stop(channel);  // 音楽を停止

      const embed = new EmbedBuilder()
        .setColor('#00FF00')  // 緑色
        .setTitle('音楽が停止しました')
        .setDescription('🛑 音楽が停止し、キューがクリアされました。');
      
      await interaction.reply({ embeds: [embed] });  // 成功メッセージを返す
    } catch (error) {
      console.error('停止エラー:', error);  // エラーをコンソールに出力

      let embed;
      
      if (error instanceof DisTubeError) {  // DisTubeError の場合
        if (error.errorCode === 'NO_QUEUE') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('キューがありません')
            .setDescription('停止するキューがありません。');
        } else {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('エラー')
            .setDescription('音楽を停止中にエラーが発生しました。');
        }
      } else {
        embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('音楽を停止中にエラーが発生しました。');
      }

      await interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  },
};
