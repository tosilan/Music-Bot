const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')  // コマンド名
    .setDescription('音楽再生のボリュームを設定します。')  // コマンドの説明
    .addIntegerOption(option => 
      option.setName('volume')  // ボリュームのオプション
        .setDescription('ボリュームレベル (0-100)。')
        .setRequired(true)),  // 必須オプション
  
  async execute(interaction) {  // コマンド実行時の処理
    const volume = interaction.options.getInteger('volume');  // ボリュームを取得
    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得
  
    if (!channel) {  // ボイスチャネルにいない場合
      const embed = new EmbedBuilder()
        .setColor('#FF0000')  // 赤色
        .setTitle('エラー')
        .setDescription('ボリュームを設定するにはボイスチャネルに入っている必要があります。');
      
      return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  
    if (volume < 0 || volume > 100) {  // ボリュームが範囲外の場合
      const embed = new EmbedBuilder()
        .setColor('#FF0000')  // 赤色
        .setTitle('無効なボリューム')
        .setDescription('ボリュームレベルは0から100の間でなければなりません。');
      
      return interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  
    try {
      await interaction.client.playerManager.distube.setVolume(channel, volume);  // ボリュームを設定
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')  // 緑色
        .setTitle('ボリューム設定完了')
        .setDescription(`🔊 ボリュームが ${volume}% に設定されました。`);
      
      await interaction.reply({ embeds: [embed] });  // 成功メッセージを返す
    } catch (error) {
      console.error('ボリューム設定エラー:', error);  // エラーをコンソールに出力
      
      let embed;
      
      if (error instanceof DisTubeError) {  // DisTubeError の場合
        if (error.errorCode === 'NO_QUEUE') {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('キューがありません')
            .setDescription('ボリュームを設定するキューがありません。');
        } else {
          embed = new EmbedBuilder()
            .setColor('#FF0000')  // 赤色
            .setTitle('エラー')
            .setDescription('ボリュームを設定中にエラーが発生しました。');
        }
      } else {
        embed = new EmbedBuilder()
          .setColor('#FF0000')  // 赤色
          .setTitle('エラー')
          .setDescription('ボリュームを設定中にエラーが発生しました。');
      }
      
      await interaction.reply({ embeds: [embed] });  // エラーメッセージを返す
    }
  },
};
