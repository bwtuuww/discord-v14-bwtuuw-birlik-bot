const { EmbedBuilder, PermissionsBitField, Colors, ButtonBuilder, ButtonStyle } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ayrıl")
    .setDescription("Klandan ayrılırsınız!"),
  run: async (client, interaction) => {
    const member = interaction.member;
    if (interaction.channel.id !== "1271085578045231189")
      return interaction.reply({
        content: ":information_source: Bu komutu sadece <#1271085578045231189> kanalında kullanabilirsiniz!",
        ephemeral: true,
      });

    let roller = [
      "1272847964687175755", // TSK
      "1272848098523353168", // JGK
      "1272848101786255411", // PÖH
      "1272848009276821617", // EGM
      // Alttaki Roller
      // Elmas, Altın, Bronz rolleri
      "1272848274528665721", // TSK
      "1272848283257147496",
      "1272848285652221952",
      "1272848286302077040", // JGK
      "1272848286629367822",
      "1272848288386908191",
      "1272848614737051721", // EGM
      "1272848620571459585",
      "1272848623633174610",
      "1272848725936570412", // PÖH
      "1272848740213981226",
      "1272848743582007409",
    ]; 

    let rolVar = false;

    for (const rol of roller) {
      if (member.roles.cache.has(rol)) {
        rolVar = true;
        break;
      }
    }

    if (!rolVar) {
      return interaction.reply({
        content: ":x: Bu işlemi gerçekleştirmek için birlik üyesi olmalısınız. Lütfen birlik durumunuzu kontrol edin.",
        ephemeral: true,
      });
    }

    member.setNickname(" ");

    for (const rol of roller) {
      if (member.roles.cache.has(rol)) {
        try {
          await member.roles.remove(rol);
          // 1 saniyelik gecikme ekleyin
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Rol kaldırılamadı: ${rol}`, error);
        }
      }
    }

    await interaction.reply({
      content: `**[${now}]** : **(${member})** Başarıyla klan **ayrıldınız.**`,
      ephemeral: false,
    }).catch(console.error);
  },
};
