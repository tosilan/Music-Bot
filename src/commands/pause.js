const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('現在の曲を一時停止します。'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('エラー')
        .setDescription('❌ 音楽を一時停止するには、ボイスチャンネルに参加している必要があります。')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
    }

    try {
      const queue = interaction.client.playerManager.distube.getQueue(channel);

      if (!queue) {
        const noQueueEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('エラー')
          .setDescription('❌ 現在再生中の音楽はありません。')
          .setTimestamp();

        return interaction.reply({ embeds: [noQueueEmbed], ephemeral: true });
      }

      if (queue.paused) {
        const alreadyPausedEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('音楽はすでに一時停止中')
          .setDescription('⏸ 音楽はすでに一時停止しています。')
          .setTimestamp();

        return interaction.reply({ embeds: [alreadyPausedEmbed], ephemeral: true });
      }

      await interaction.client.playerManager.distube.pause(channel);

      const pausedEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('音楽が一時停止されました')
        .setDescription('⏸ 現在の曲が一時停止されました。')
        .setTimestamp();

      await interaction.reply({ embeds: [pausedEmbed] });

    } catch (error) {
      console.error('一時停止エラー:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('エラー')
        .setDescription('❌ 曲を一時停止しようとしたときにエラーが発生しました。')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
