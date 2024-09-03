const { EmbedBuilder, PermissionsBitField, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require("../config.js");
const User = require("../mongodb/Schema.js"); // bwtuuw
const Klan = require("../mongodb/KlanSchema.js");
const moment = require('moment');

const allowedRoles = [ // Butonları kullanıcak yetki rolü id'si
    "1272849626155974706",
    "1272849570229129227"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profil")
        .setDescription("Belirtilen kullanıcının profil bilgilerini gösterir.")
        .addUserOption(option =>
            option.setName("kişi")
                .setDescription("Bilgilerini görüntülemek istediğiniz kişiyi seçin")
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const user = interaction.options.getUser("kişi"); // bwtuuw
        const userID = user.id;

        let userDoc;
        try {
            userDoc = await User.findOne({ userID });
        } catch (error) {
            console.error("Kullanıcı bilgileri alınırken bir hata oluştu:", error);
            return interaction.reply({ content: "Kullanıcı bilgileri alınırken bir hata oluştu.", ephemeral: true });
        }

        if (!userDoc) {
            return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true }); // bwtuuw
        }

        const { username: oldNickname, rütbe } = userDoc;

        let hakSayısı = 0;
        try {
            const klan = await Klan.findOne({ KlanUser: userID });
            hakSayısı = klan ? klan.hak : 0;
        } catch (error) {
            console.error("Klan hakkı alınırken bir hata oluştu:", error);
        }

        const roleMap = {
            "1272847964687175755": "Türk Silahlı Kuvvetleri", // bwtuuw
            "1272848009276821617": "Emniyet Genel Müdürlüğü",
            "1272848098523353168": "Jandarma Genel Müdürlüğü",
            "1272848101786255411": "Polis Özel Harekat",
        };

        let birlik = "Bilinmiyor";
        const member = await interaction.guild.members.fetch(userID);
        if (member) {
            for (const [roleID, roleName] of Object.entries(roleMap)) {
                if (member.roles.cache.has(roleID)) {
                    birlik = roleName;
                    break;
                }
            }
        }

        const newNickname = member ? member.displayName : oldNickname; // bwtuuw

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'nin genel bilgileri ve klan durumu`)
            .addFields(
                { name: 'Kullanıcı Adı ', value: `\`\`\`${newNickname} \`\`\`  (<@${userID}>)`, inline: true },
                { name: 'Discord ID', value: `\`\`\`${userID}\`\`\``, inline: true },
                { name: 'Klan Hak Sayısı', value: `\`\`\`${hakSayısı}\`\`\``, inline: true },
                { name: 'Birlik', value: `\`\`\`${birlik}\`\`\``, inline: true },
                { name: 'Rütbe', value: `\`\`\`${rütbe}\`\`\``, inline: true }
            )
            .setImage("https://i.hizliresim.com/rqcprit.gif")
            .setColor(Colors.DarkGrey)

        const initialButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder() // bwtuuw
                    .setCustomId('secenekler')
                    .setLabel('Seçenekler')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:menu:1274824862883643573>")
            );

        await interaction.reply({ embeds: [embed], components: [initialButton] });

        const filter = i => i.customId === 'secenekler' || i.customId === 'geri' || i.customId === 'mute' || i.customId === 'unmute';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const commandUserId = interaction.user.id;
 // bwtuuw
            if (i.user.id !== commandUserId) {
                return i.reply({ content: "Bu buton yalnızca komutu kullanan kişi tarafından kullanılabilir.", ephemeral: true });
            }

            if (!allowedRoles.some(roleID => i.member.roles.cache.has(roleID))) {
                return i.reply({ content: "Bu işlemi yapma yetkiniz yok.", ephemeral: true });
            }

            if (i.customId === 'secenekler') {
                const optionsButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('mute')
                            .setLabel('Sustur') // bwtuuw
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji("<:volumemute:1274824865723191307>"),
                        new ButtonBuilder()
                            .setCustomId('unmute')
                            .setLabel('Susturulması Aç')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji("<:volumeup:1274824864473153637>"),
                        new ButtonBuilder()
                            .setCustomId('geri')
                            .setLabel('Geri')
                            .setEmoji("<:back:1274826629587402854>")
                            .setStyle(ButtonStyle.Secondary),
                    );

                await i.update({ components: [optionsButtons] });
            } else if (i.customId === 'geri') {
                const backButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder() // bwtuuw
                            .setCustomId('secenekler')
                            .setLabel('Seçenekler')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji("<:menu:1274824862883643573>")
                    );

                await i.update({ components: [backButton] });
            } else if (i.customId === 'mute') {
                if (member) {
                    const now = moment().format('YYYY-MM-DD HH:mm:ss');
                    const endDate = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

                    await member.timeout(10 * 60 * 1000, `Mute komutu ile atıldı. (${now} - ${endDate})`);
                    await i.reply({ content: `${user.username} ${now} tarihinde 10 dakika süreyle susturuldu. ${endDate} tarihinde açılacak.`, ephemeral: true });

                    const channels = interaction.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' || c.type === 'GUILD_VOICE');
                    channels.forEach(channel => {
                        channel.permissionOverwrites.edit(member.id, {
                            SEND_MESSAGES: false,
                            CONNECT: false
                        });
                    });

                    const logChannel = interaction.guild.channels.cache.get(config.logChannelID);
                    if (logChannel) { // bwtuuw
                        const muteEmbed = new EmbedBuilder()
                            .setTitle('Susturma İşlemi')
                            .addFields(
                                { name: 'Sunucu Adı', value: `\`\`\`${newNickname} || ID: ${userID}\`\`\``, inline: true },
                                { name: 'Atan Kişi', value: `\`\`\`${interaction.user.username} || ID: ${interaction.user.id}\`\`\``, inline: true },
                                { name: 'Süre', value: '\`\`\`10 dakika\`\`\`', inline: true },
                                { name: 'Başlangıç Tarihi', value: `\`\`\`${now}\`\`\``, inline: true },
                                { name: 'Bitiş Tarihi', value: `\`\`\`${endDate}\`\`\``, inline: true }
                            )
                            .setColor(Colors.DarkGrey)
                            .setTimestamp();

                        logChannel.send({ embeds: [muteEmbed] });
                    }
                } else {
                    await i.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });
                }
            } else if (i.customId === 'unmute') {
                if (member && member.isCommunicationDisabled()) {
                    await member.timeout(null, 'Susturma süresi doldu.');
                    await i.reply({ content: `${user.username} susturulması kaldırıldı.`, ephemeral: true });

                    const channels = interaction.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' || c.type === 'GUILD_VOICE');
                    channels.forEach(channel => {
                        channel.permissionOverwrites.edit(member.id, {
                            SEND_MESSAGES: null,
                            CONNECT: null // bwtuuw
                        });
                    });

                    const logChannel = interaction.guild.channels.cache.get(config.logChannelID);
                    if (logChannel) {
                        const unmuteEmbed = new EmbedBuilder()
                            .setTitle('Susturulma Açma İşlemi')
                            .addFields(
                                { name: 'Sunucu Adı', value: `\`\`\`${newNickname} || ID: ${userID}\`\`\``, inline: true },
                                { name: 'Açan Kişi', value: `\`\`\`${interaction.user.username} || ID: ${interaction.user.id}\`\`\``, inline: true }
                            )
                            .setColor(Colors.DarkGrey)
                            .setTimestamp();

                        logChannel.send({ embeds: [unmuteEmbed] });
                    }
                } else {
                    await i.reply({ content: "Kullanıcı zaten susturulmuyor.", ephemeral: true });
                } // bwtuuw
            }
        });

        collector.on('end', () => {
            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('secenekler')
                        .setLabel('Seçenekler')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:menu:1274824862883643573>")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('mute')
                        .setLabel('Sustur')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:volumemute:1274824865723191307>")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('unmute')
                        .setLabel('Susturulması Aç')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:volumeup:1274824864473153637>")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('geri')
                        .setLabel('Geri')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("<:back:1274826629587402854>")
                        .setDisabled(true),
                );

            interaction.editReply({ components: [disabledButtons] }); // bwtuuw
        });
    },
};








































// bwtuuw