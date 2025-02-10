const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('ボタンで音楽フィルターを選択します。'),

    async execute(interaction) {
        const filters = {
            bassboost: 'bassboost',
            '3d': '3d',
            vaporwave: 'vaporwave',
            nightcore: 'nightcore'
        };

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('フィルターを選択')
            .setDescription('以下のボタンからフィルターを選択するか、「フィルターをクリア」をクリックしてすべてのフィルターを削除してください。');
            
        const filterButtons = Object.keys(filters).map(filter => {
            return new ButtonBuilder()
                .setCustomId(`filter_${filter}`)
                .setLabel(filter)
                .setStyle(ButtonStyle.Primary);
        });

        const clearButton = new ButtonBuilder()
            .setCustomId('filter_clear')
            .setLabel('フィルターをクリア')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents([...filterButtons, clearButton]);

        await interaction.reply({ embeds: [embed], components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (!i.isButton()) return;

            const queue = interaction.client.playerManager.distube.getQueue(interaction.guildId);

            if (!queue) {
                try {
                    await i.update({
                        content: '音楽が再生されていません！',
                        components: []
                    });
                } catch (error) {
                    if (error.code !== 10062 && error.code !== 10008) console.error('インタラクションの更新に失敗しました:', error);
                }
                return;
            }

            const selectedFilter = i.customId.split('_')[1];
            const activeFilters = queue.filters.names;
            const filter = filters[selectedFilter];

            try {
                let newDescription;

                if (selectedFilter === 'clear') {
                    queue.filters.clear();
                    newDescription = 'すべてのフィルターがクリアされました！';
                } else {
                    if (activeFilters.length > 0 && !activeFilters.includes(filter)) {
                        newDescription = `最初に「フィルターをクリア」をクリックして現在のフィルターをクリアしてください。**${filter}** フィルターを適用する前に。`;
                    } else if (activeFilters.includes(filter)) {
                        queue.filters.remove(filter);
                        newDescription = `**${filter}** フィルターが削除されました！`;
                    } else {
                        queue.filters.add(filter);
                        newDescription = `**${filter}** フィルターが適用されました！`;
                    }
                }

                const updatedEmbed = EmbedBuilder.from(embed)
                    .setDescription(newDescription);

                await i.update({
                    embeds: [updatedEmbed],
                    components: [row]
                });

            } catch (error) {
                if (error.code !== 10062 && error.code !== 10008) {
                    console.error('インタラクションの処理に失敗しました:', error);
                }
            }
        });

        collector.on('end', async () => {
            row.components.forEach(button => button.setDisabled(true));

            try {
                await interaction.editReply({
                    components: [row]
                });
            } catch (error) {
                if (error.code !== 10008) console.error('インタラクションの返信の編集に失敗しました:', error);
            }
        });
    },
};
