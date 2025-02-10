// 環境変数を読み込む
require('dotenv').config();
// Discord のスラッシュコマンドを作成
const { SlashCommandBuilder } = require('@discordjs/builders');
// Discord のアクション行、ボタン、埋め込みメッセージを使用
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
// Google API を使用
const { google } = require('googleapis');
const yt = google.youtube('v3');
// YouTube 検索パッケージをインポート
const ytSearch = require('yt-search');
// Spotify API ライブラリ
const SpotifyWebApi = require('spotify-web-api-node');

// API キーの設定
const { youtubeApiKey, spotify } = require('../config/config');
const API_KEY = youtubeApiKey;
// Spotify API のインスタンスを作成
const spotifyApi = new SpotifyWebApi({
  clientId: spotify.clientId,
  clientSecret: spotify.clientSecret,
});

// スラッシュコマンドのエクスポート
module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')  // コマンド名
    .setDescription('曲またはプレイリストを検索して再生します。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')  // 検索サブコマンド
        .setDescription('曲を検索して再生します。')
        .addStringOption(option =>
          option.setName('query')
            .setDescription('検索する曲')
            .setRequired(true)))  // 必須オプション
    .addSubcommand(subcommand =>
      subcommand
        .setName('playlist')  // プレイリストサブコマンド
        .setDescription('YouTube のプレイリストを再生します。')
        .addStringOption(option =>
          option.setName('url')
            .setDescription('YouTube プレイリストの URL')
            .setRequired(true)))  // 必須オプション
    .addSubcommand(subcommand =>
      subcommand
        .setName('spotify')  // Spotify サブコマンド
        .setDescription('Spotify の曲またはプレイリストを再生します。')
        .addStringOption(option =>
          option.setName('url')
            .setDescription('Spotify トラックまたはプレイリストの URL')
            .setRequired(true))),

  async execute(interaction) {  // コマンドが実行されたとき
    const subcommand = interaction.options.getSubcommand();
    const query = interaction.options.getString('query') || interaction.options.getString('url');
    const channel = interaction.member.voice.channel;  // ユーザーのボイスチャネルを取得

    if (!channel) {  // ボイスチャネルにいない場合
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 音楽を再生するにはボイスチャネルに入っている必要があります。')],
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply();

      // プレイリスト再生処理
      if (subcommand === 'playlist') {
        const playlistIdMatch = query.match(/list=([^&]+)/);
        if (playlistIdMatch) {
          const playlistId = playlistIdMatch[1];

          const playlistResponse = await yt.playlistItems.list({
            key: API_KEY,
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50,
          });

          const videos = playlistResponse.data.items;

          if (videos.length === 0) {
            return interaction.followUp({
              embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 プレイリストに動画が見つかりませんでした。')],
            });
          }

          const videoUrls = videos.map(video => `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`);

          await interaction.client.playerManager.distube.play(channel, videoUrls[0], {
            member: interaction.member,
            textChannel: interaction.channel,
            skip: true,
          });

          for (let i = 1; i < videoUrls.length; i++) {
            await interaction.client.playerManager.distube.play(channel, videoUrls[i], {
              member: interaction.member,
              textChannel: interaction.channel,
              skip: false,
            });
          }

          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setColor('#FF00FF')
                .setDescription(`🎶 プレイリストから **${videos.length}** 曲をキューしました。`),
            ],
          });
          return;
        } else {
          return interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 無効なプレイリスト URL です。')],
          });
        }
      }

      // 曲検索処理
      if (subcommand === 'search') {
        const searchResult = await ytSearch(query);

        if (!searchResult || !searchResult.videos.length) {
          return interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 あなたの検索クエリに対して曲が見つかりませんでした。')],
          });
        }

        const videos = searchResult.videos.slice(0, 5);  // 上位5つの動画を取得

        const embed = new EmbedBuilder()
          .setTitle('検索結果')
          .setDescription('再生する曲を選択してください:')
          .setColor('#ff0000');
        
        videos.forEach((video, index) => {
          embed.addFields({
            name: `${index + 1}. ${video.title}`,
            value: `時間: ${video.timestamp} | ${video.author.name}`,
            inline: false,
          });
        });
        
        const row1 = new ActionRowBuilder();
        
        videos.forEach((video, index) => {
          row1.addComponents(
            new ButtonBuilder()
              .setCustomId(`play_${index}`)
              .setLabel(`${index + 1}`)
              .setStyle(ButtonStyle.Primary)
          );
        });
        
        const sentMessage = await interaction.followUp({ embeds: [embed], components: [row1] });
        

        const filter = i => i.customId.startsWith('play_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
          const [action, index] = i.customId.split('_'); // 選択された曲のインデックスを取得
          const selectedVideo = videos[parseInt(index)];

          if (selectedVideo) {
            try {
              await i.deferUpdate();

              await interaction.client.playerManager.distube.play(channel, selectedVideo.url, {
                member: interaction.member,
                textChannel: interaction.channel,
              });

              const disabledRow1 = new ActionRowBuilder().addComponents(
                row1.components.map(button => button.setDisabled(true))
              );

              await sentMessage.edit({ components: [disabledRow1] });
              await interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor('#FF00FF')
                    .setDescription(`🎶 キューされた: **${selectedVideo.title}**`),
                ],
                ephemeral: true,
              });

            } catch (error) {
              console.error('再生エラー:', error);
              await interaction.followUp({
                embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 曲を再生しようとしてエラーが発生しました。')],
              });
            }
          } else {
            await i.followUp({
              embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 選択された曲が見つかりませんでした。')],
              ephemeral: true,
            });
          }

          collector.stop();
        });

        collector.on('end', collected => {
          if (!collected.size) {
            interaction.editReply({
              embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription('⚠️ 時間内に曲を選択しませんでした。')],
            });
          }
        });

      // Spotify からの再生処理
      } else if (subcommand === 'spotify') {
        const isSpotifyPlaylist = query.includes('playlist');
        const isSpotifyTrack = query.includes('track');
        const isSpotifyAlbum = query.includes('album');
        const isSpotifyArtist = query.includes('artist');
        const isSpotifyCollection = query.includes('collection');
    
        if (isSpotifyPlaylist || isSpotifyTrack || isSpotifyAlbum || isSpotifyArtist || isSpotifyCollection) {
            try {
                const accessToken = await spotifyApi.clientCredentialsGrant().then(
                    data => data.body['access_token'],
                    error => {
                        throw new Error('SpotifyAccessError');
                    }
                );
    
                spotifyApi.setAccessToken(accessToken);
                let trackNames = [];
                let playlistInfo;
    
                if (isSpotifyTrack) {
                    const trackId = query.split('track/')[1].split('?')[0];
                    const trackInfo = await spotifyApi.getTrack(trackId);
                    trackNames.push(`${trackInfo.body.name} ${trackInfo.body.artists[0].name}`);
                } else if (isSpotifyPlaylist) {
                    const playlistId = query.split('playlist/')[1].split('?')[0];
                    playlistInfo = await spotifyApi.getPlaylistTracks(playlistId);
                    trackNames = playlistInfo.body.items
                        .filter(item => item && item.track)
                        .map(item => `${item.track.name} ${item.track.artists[0]?.name || ''}`);
                } else if (isSpotifyAlbum) {
                    const albumId = query.split('album/')[1].split('?')[0];
                    const albumInfo = await spotifyApi.getAlbumTracks(albumId);
                    trackNames = albumInfo.body.items
                        .map(track => `${track.name} ${track.artists[0]?.name || ''}`);
                } else if (isSpotifyArtist) {
                    const artistId = query.split('artist/')[1].split('?')[0];
                    const artistTopTracks = await spotifyApi.getArtistTopTracks(artistId, 'US');
                    trackNames = artistTopTracks.body.tracks
                        .map(track => `${track.name} ${track.artists[0]?.name || ''}`);
                } else if (isSpotifyCollection) {
                    return; // Spotifyコレクションが必要であれば処理を追加
                }
    
                const queuedTracks = [];
                const videoUrls = [];
    
                for (const trackName of trackNames) {
                    try {
                        const searchResult = await ytSearch(trackName);
                        if (searchResult && searchResult.videos.length > 0) {
                            const video = searchResult.videos[0];
                            videoUrls.push(video.url);
                            queuedTracks.push(video.title);
                        }
                    } catch (error) {
                        if (error.errorCode === 'NON_NSFW') {
                            await interaction.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('#FF0000')
                                        .setDescription(`🚫 年齢制限コンテンツをスキップしました: **${trackName}**。このトラックは非NSFWチャンネルでは再生できません。`),
                                ],
                            });
                            continue;
                        } else {
                            throw error;
                        }
                    }
                }
    
                if (queuedTracks.length > 0) {
                    await interaction.client.playerManager.distube.play(channel, videoUrls[0], {
                        member: interaction.member,
                        textChannel: interaction.channel,
                        skip: true,
                    });
    
                    for (let i = 1; i < videoUrls.length; i++) {
                        await interaction.client.playerManager.distube.play(channel, videoUrls[i], {
                            member: interaction.member,
                            textChannel: interaction.channel,
                            skip: false,
                        });
                    }
    
                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#FF00FF')
                                .setDescription(`🎶 Spotify から **${queuedTracks.length}** トラックをキューしました。`),
                        ],
                    });
                } else {
                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#FFFF00')
                                .setDescription('🚫 Spotify から有効なトラックが見つかりませんでした。'),
                        ],
                    });
                }
    
            } catch (error) {
                let errorMessage = '🚫 Spotify からの再生時にエラーが発生しました。';
                if (error.message === 'SpotifyAccessError') {
                    errorMessage = '🚫 Spotify アクセストークンの取得に失敗しました。';
                }
    
                await interaction.followUp({
                    embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription(errorMessage)],
                });
            }
        } else {
            await interaction.followUp({
                embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 無効な Spotify URL です。')],
            });
        }
    }

    } catch (error) {
      await interaction.followUp({
        embeds: [new EmbedBuilder().setColor('#FFFF00').setDescription('🚫 リクエストの処理中にエラーが発生しました。')],
      });
    }
};
