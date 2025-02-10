const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('previous')  // コマンド名
      .setDescription('キューの前の曲を再生します。'),  // コマンドの説明
  
    async execute(interaction) {  // コマンド実行時の処理
      const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
  
      if (!channel) {  // ボイスチャネルにいない場合
        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('音楽を再生するにはボイスチャネルに入っている必要があります。');
          
        return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }
  
      try {
        await interaction.client.playerManager.distube.previous(channel);  // 前の曲を再生

        const embed = new EmbedBuilder()
          .setColor('#00FF00')  // 緑色
          .setTitle('前の曲')
          .setDescription('⏮ 前の曲を再生しました。');
          
        await interaction.reply({ embeds: [embed] });  // 成功メッセージを返す
      } catch (error) {
        console.error('前の曲のエラー:', error);  // エラーをコンソールに出力

        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('前の曲を再生中にエラーが発生しました。');
          
        await interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }
    },
};
