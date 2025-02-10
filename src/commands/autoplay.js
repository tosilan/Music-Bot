const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('自動再生モードを切り替えます。'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('❌ 自動再生を切り替えるには、音声チャンネルにいる必要があります。')
        .setTimestamp();

      return interaction.reply({ embeds: [noChannelEmbed], ephemeral: true });
    }

    try {
      const autoplay = interaction.client.playerManager.distube.toggleAutoplay(channel);

      const autoplayEmbed = new EmbedBuilder()
        .setColor(autoplay ? '#00ff00' : '#ff9900')
        .setTitle('Autoplay Toggled')
        .setDescription(`🔄 自動再生は **${autoplay ? '有効' : '無効'}になりました**.`)
        .setTimestamp();

      await interaction.reply({ embeds: [autoplayEmbed] });

    } catch (error) {
      console.error('自動再生エラーの切り替え：', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('❌ 自動再生の切り替え中にエラーが発生しました。後でもう一度お試しください。')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
