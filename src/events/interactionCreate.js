const { 
  EmbedBuilder,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ButtonInteraction,
} = require("discord.js");
const { readdirSync } = require("fs");
const config = require("../config.js");
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  name: "interactionCreate",
  execute: async (interaction) => {
    let client = interaction.client;

    if (interaction.type == InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;

      readdirSync("./src/commands").forEach((file) => {
        const command = require(`../../src/commands/${file}`);
        if (
          interaction.commandName.toLowerCase() ===
          command.data.name.toLowerCase()
        ) {
          command.run(client, interaction);
        }
      });
    }

    if (interaction.customId === "ilan-ver") {
      const modal = new ModalBuilder()
        .setCustomId("ilan-ver-modal")
        .setTitle("İlan Bilgileri");

      const input = new TextInputBuilder()
        .setCustomId("ilan-ver-input")
        .setPlaceholder("Mercedes-Benz E-Class")
        .setLabel("Araç tipi")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const input2 = new TextInputBuilder()
        .setCustomId("ilan-ver-input2")
        .setPlaceholder("Gümüş, 2.0L Motor, Elektrikli")
        .setLabel("Araç detayları")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const input3 = new TextInputBuilder()
        .setCustomId("ilan-ver-input3")
        .setPlaceholder("+240")
        .setLabel("Araç maksimum hız (KM/H)")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const input4 = new TextInputBuilder()
        .setCustomId("ilan-ver-input4")
        .setPlaceholder("950.000 ₺")
        .setLabel("Fiyat değeri ekleyin")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const input5 = new TextInputBuilder()
        .setCustomId("ilan-ver-input5")
        .setPlaceholder("https://i.hizliresim.com/cdwjnzm.png")
        .setLabel("Görseli buraya yükleyin")
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const inputrow = new ActionRowBuilder().addComponents(input);
      const inputrow2 = new ActionRowBuilder().addComponents(input2);
      const inputrow3 = new ActionRowBuilder().addComponents(input3);
      const inputrow4 = new ActionRowBuilder().addComponents(input4);
      const inputrow5 = new ActionRowBuilder().addComponents(input5);

      modal.addComponents(inputrow, inputrow2, inputrow3, inputrow4, inputrow5);
      await interaction.showModal(modal);
    }

    if (interaction.customId === "ilan-ver-modal") {
      let model = interaction.fields.getTextInputValue("ilan-ver-input");
      let ozellik = interaction.fields.getTextInputValue("ilan-ver-input2");
      let km = interaction.fields.getTextInputValue("ilan-ver-input3");
      let fiyat = interaction.fields.getTextInputValue("ilan-ver-input4");
      let url = interaction.fields.getTextInputValue("ilan-ver-input5");

      try {
        const { default: fetch } = await import('node-fetch'); 

        const urlPattern = /^https:\/\/i\.hizliresim\.com\/[a-zA-Z0-9]+\.png$/;
        if (!urlPattern.test(url)) {
          return interaction.reply({
            content: "Geçersiz URL girdiniz. Lütfen geçerli bir hizliresim.com URL'si giriniz.",
            ephemeral: true,
          });
        }

        const response = await fetch(url);

        const contentType = response.headers.get('content-type');
        if (!response.ok) {
          throw new Error('Resim URL’si erişilemedi.');
        }
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error('Geçersiz resim URL’si.');
        }

        let button = new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Araç İlanı Ver")
          .setCustomId("ilan-ver")
          .setEmoji("<:car:1274740654433374309>");

        let deleteButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Sil")
          .setCustomId("ilan-sil")
          .setEmoji("<:unlem:1274740196340138045>");

        let bilgi = new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Kullanım Koşulları")
          .setCustomId("bilgi-al")
          .setEmoji("<:book:1274793991858163844>");

        let embed = new EmbedBuilder()
          .setColor(Colors.DarkGrey)
          .setTitle(`Sahibinden.com`)
          .addFields(
            { name: "Araç tipi", value: `\`\`\`${model}\`\`\``, inline: true },
            { name: "Araç detayları", value: `\`\`\`${ozellik}\`\`\``, inline: true },
            { name: "Araç maksimum hız (KM/H)", value: `\`\`\`${km}\`\`\``, inline: true },
            { name: "Araç değeri", value: `\`\`\`${fiyat} ₺\`\`\``, inline: true },
            { name: "Araç sahibi", value: `\`\`\`${interaction.user.username}\`\`\``, inline: true }
          )
          .setImage(url)
          .setFooter({ text: `İlanın Sahibi: ${interaction.user.username} || ID: ${interaction.user.id}` });

        await interaction.reply({
          content: "## - İlanınız başarıyla **oluşturuldu.** Şimdi tek yapmanız gereken, potansiyel müşterilerin size ulaşmasını beklemek!",
          ephemeral: true,
        });

        const channel = interaction.guild.channels.cache.get(config.kanalid);
        if (channel) {
          const message = await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(bilgi,button,deleteButton)],
          });

          const thread = await message.startThread({
            name: `${model} || ${interaction.user.username}`,
            autoArchiveDuration: 60,
            type: ChannelType.PublicThread,
            reason: "İlan kanalı",
          });

          await thread.send(`**[${now}]** <@${interaction.user.id}> İlanınız başarıyla **oluşturuldu.** Şimdi tek yapmanız gereken, potansiyel müşterilerin size ulaşmasını beklemek!`);

        }
      } catch (error) {
        await interaction.reply({
          content: `Hata: ${error.message} Lütfen geçerli bir resim URL'si giriniz.`,
          ephemeral: true,
        });
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "ilan-sil") {
        if (interaction.user.id !== interaction.message.embeds[0].footer.text.split('|| ID: ')[1] &&
          !interaction.member.roles.cache.has('1272849570229129227')) {
          return interaction.reply({
            content: "Bu işlemi gerçekleştirme yetkiniz yok.",
            ephemeral: true,
          });
        }

        await interaction.message.delete();

        await interaction.reply({
          content: "İlan mesajı başarıyla silindi.",
          ephemeral: true,
        });
      }
    }
  },
};
