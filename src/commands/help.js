const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('利用可能なコマンドを表示します。'),
  
  async execute(interaction) {
    // コマンドファイルが含まれるフォルダーへのパス
    const commandsFolder = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));

    const helpEmbed = new EmbedBuilder()
      .setTitle('ヘルプ - 利用可能なコマンド')
      .setDescription('- 開発者 : GlaceYT\n- タイプ : 無料版')
      .setColor('#0099ff');

    commandFiles.forEach(file => {
      const command = require(path.join(commandsFolder, file));
      if (command.data && command.data.name && command.data.description) {
        helpEmbed.addFields({
          name: `/${command.data.name}`,
          value: command.data.description,
        });
      }
    });

    await interaction.reply({ embeds: [helpEmbed] });
  },
};
