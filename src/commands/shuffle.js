const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('shuffle')  // コマンド名
      .setDescription('キューの曲をシャッフルします。'),  // コマンドの説明
  
    async execute(interaction) {  // コマンド実行時の処理
      const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
  
      if (!channel) {  // ボイスチャネルにいない場合
        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('キューをシャッフルするにはボイスチャネルに入っている必要があります。');
          
        return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }
  
      try {
        await interaction.client.playerManager.distube.shuffle(channel);  // キューをシャッフル

        const embed = new EmbedBuilder()
          .setColor('#00FF00')  // 緑色
          .setTitle('キューをシャッフルしました')
          .setDescription('🔀 キューがシャッフルされました。');
          
        await interaction.reply({ embeds: [embed] });  // 成功メッセージを返す
      } catch (error) {
        console.error('シャッフルエラー:', error);  // エラーをコンソールに出力

        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('キューをシャッフル中にエラーが発生しました。');
          
        await interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }
    },
};
