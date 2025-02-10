const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('seek')  // コマンド名
      .setDescription('曲の特定の時間にシークします。')  // コマンドの説明
      .addIntegerOption(option => 
        option.setName('time')  // 時間のオプション
          .setDescription('シークする秒数。')
          .setRequired(true)),  // 必須オプション
  
    async execute(interaction) {  // コマンド実行時の処理
      const time = interaction.options.getInteger('time');  // シークする時間を取得
      const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
  
      if (!channel) {  // ボイスチャネルにいない場合
        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('曲をシークするにはボイスチャネルに入っている必要があります。');
          
        return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }
  
      try {
        await interaction.client.playerManager.distube.seek(channel, time);  // 指定された時間にシーク

        const embed = new EmbedBuilder()
          .setColor('#00FF00')  // 緑色
          .setTitle('シーク完了')
          .setDescription(`⏩ ${time} 秒にシークしました。`);
          
        await interaction.reply({ embeds: [embed] });  // 成功メッセージを返す
      } catch (error) {
        console.error('シークエラー:', error);  // エラーをコンソールに出力

        const embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('曲をシークしようとしたときにエラーが発生しました。');
          
        await interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
      }
    },
};
