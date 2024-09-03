const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const User = require("../mongodb/Schema"); // Kullanıcı modelinin doğru yolda olduğundan emin olun

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kontrol")
    .setDescription("Kullanıcının isim geçmişini kontrol edersiniz!")
    .addUserOption(option =>
      option
        .setName("kişi")
        .setDescription("İsim geçmişi kontrol edilecek kişiyi seçin")
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has("1256886023129006191")) {
      return interaction.reply({
        content: ":information_source: Gerekli rütbeye sahip olmadığınız için bu talep işleme alınamamaktadır. Rütbenizi kontrol edin.",
        ephemeral: true,
      }).catch(console.error);
    }

    if (interaction.channel.id !== "1271085578045231189") {
      return interaction.reply({
        content: ":information_source: Bu komutu sadece <#1271085578045231189> kanalında kullanabilirsiniz!",
        ephemeral: true,
      }).catch(console.error);
    }

    const member = interaction.options.getMember("kişi");

    async function getUsernameHistory(userID) {
      try {
        const user = await User.findOne({ userID: userID });
        return user ? user.usernameHistory : [];
      } catch (err) {
        console.error("Özgeçmiş'i alınırken bir hata oluştu:", err);
        return [];
      }
    }

    async function getStaffUsername(staffID) {
      try {
        const guildMember = await member.guild.members.fetch(staffID);
        return guildMember ? guildMember.user.tag : 'Bilinmiyor';
      } catch (err) {
        console.error("Staff kullanıcı adı alınırken bir hata oluştu:", err);
        return 'Bilinmiyor';
      }
    }

    const history = await getUsernameHistory(member.id);
    const ITEMS_PER_PAGE = 4; 
    let currentPage = 0;

    async function generateEmbed(page) {
      const start = page * ITEMS_PER_PAGE;
      const end = Math.min(start + ITEMS_PER_PAGE, history.length);

      const historyMessages = await Promise.all(history.slice(start, end).map(async (x) => {
        const staffTag = await getStaffUsername(x.staffID);
        
        return `\`\`\`Kimlik bandı: ${x.username} || ID: ${member} \nAlan Rütbeli: ${staffTag} || ID: <@${x.staffID}>\`\`\` `;
      }));

      return new EmbedBuilder()
      .setTitle(`Kullanıcının Özgeçmiş'i: ${member}`)
        .setDescription(historyMessages.join('\n\n') || "Özgeçmiş bulunamadı.")
        .setFooter({ text: `# Sayfa ${page + 1}/${Math.ceil(history.length / ITEMS_PER_PAGE)}` });
    }

    const previousButton = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('Önceki')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0);

    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Sonraki')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= Math.ceil(history.length / ITEMS_PER_PAGE) - 1);

    const actionRow = new ActionRowBuilder()
      .addComponents(previousButton, nextButton);

    const message = await interaction.reply({
      embeds: [await generateEmbed(currentPage)],
      components: [actionRow],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'next') {
        currentPage++;
        
        if (currentPage >= Math.ceil(history.length / ITEMS_PER_PAGE)) {
          currentPage = 0; 
        }
      } else if (i.customId === 'previous') {
        currentPage--;
        
        if (currentPage < 0) {
          currentPage = Math.ceil(history.length / ITEMS_PER_PAGE) - 1; 
        }
      }

      await i.update({
        embeds: [await generateEmbed(currentPage)],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Önceki')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Sonraki')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage >= Math.ceil(history.length / ITEMS_PER_PAGE) - 1)
            )
        ]
      });
    });

    collector.on('end', () => {
      message.edit({
        components: []
      });
    });
  },
};
