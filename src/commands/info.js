const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('ボットに関する情報を提供します。'),
  
  async execute(interaction) {
    const { client } = interaction;  

    // ボットのPing
    const ping = client.ws.ping;

    // サーバー数とユーザー数
    const serverCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    // ボットの作成日
    const botCreationDate = client.user.createdAt.toDateString();

    // アップタイム
    const uptime = os.uptime();
    const uptimeFormatted = new Date(uptime * 1000).toISOString().substr(11, 8);

    // 埋め込みメッセージの作成
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('ボット情報')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'ボット名', value: client.user.username, inline: false },
        { name: 'Ping', value: `${ping}ms`, inline: false },
        { name: 'サーバー数', value: `${serverCount}`, inline: false },
        { name: '総ユーザー数', value: `${userCount}`, inline: false },
        { name: 'ボット作成日', value: botCreationDate, inline: false },
      )
      .setFooter({ text: `リクエスト者: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // 埋め込みメッセージを返信
    await interaction.reply({ embeds: [embed] });
  },
};
