const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('キュー内の特定の曲にジャンプします。')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('キュー内の曲の位置。')
        .setRequired(true)),

  async execute(interaction) {
    const position = interaction.options.getInteger('position');
    const channel = interaction.member.voice.channel;

    // ボイスチャンネルにいない場合の処理
    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('エラー')
        .setDescription('❌ 曲にジャンプするにはボイスチャンネルにいる必要があります。')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
    }

    try {
      // 曲にジャンプする処理
      await interaction.client.playerManager.distube.jump(channel, position - 1);

      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('曲にジャンプしました')
        .setDescription(`🔀 成功裏にキューの **#${position}** の曲にジャンプしました。`)
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('ジャンプエラー:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('エラー')
        .setDescription('❌ その曲にジャンプしようとしたときにエラーが発生しました。位置が有効であることを確認し、再試行してください。')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
