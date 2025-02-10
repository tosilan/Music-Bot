const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ループ')
    .setDescription('キューのリピートモードを設定します。')
    .addIntegerOption(option =>
      option.setName('モード')
        .setDescription('リピートモード: 0 (オフ), 1 (曲), 2 (キュー)')
        .setRequired(true)),

  async execute(interaction) {
    const mode = interaction.options.getInteger('モード');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('エラー')
        .setDescription('❌ リピートモードを設定するには、ボイスチャンネルに参加している必要があります。')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
    }

    try {
      const repeatMode = await interaction.client.playerManager.distube.setRepeatMode(channel, mode);

      const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('リピートモード設定完了')
        .setDescription(`🔁 リピートモードが**${repeatMode === 0 ? 'オフ' : repeatMode === 1 ? '曲' : 'キュー'}**に設定されました。`)
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('リピートモード設定エラー:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('エラー')
        .setDescription('❌ リピートモードを設定中にエラーが発生しました。もう一度お試しください。')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
