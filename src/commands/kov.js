const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kov")
    .setDescription("Bir kişiyi klandan kovarsınız!")
    .addUserOption((option) =>
      option
        .setName("kişi")
        .setDescription("Klandan kovulacak kişiyi seçin")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("sebep")
        .setDescription("Kovma sebebini seçin")
        .setRequired(true)
        .addChoices(
          { name: 'Askeri disiplin kurallarına uyulmaması', value: 'Askeri disiplin kurallarına uyulmaması' },
          { name: 'Emirlere itaatsizlik', value: 'Emirlere itaatsizlik' },
          { name: 'Görevi kötüye kullanma', value: 'Görevi kötüye kullanma' },
          { name: 'Askeri ya da sivil kanunlara aykırı suç işlemek', value: 'Askeri ya da sivil kanunlara aykırı suç işlemek' },
          { name: 'Terör örgütlerine destek verme', value: 'Terör örgütlerine destek verme' },
          { name: 'Yalan söyleme veya hile yapma', value: 'Yalan söyleme veya hile yapma' },
          { name: 'Devlet sırlarını veya askeri bilgileri ifşa etmek', value: 'Devlet sırlarını veya askeri bilgileri ifşa etmek' },
          { name: 'Rütbe Aşımı ve Rütbeyi Kötüye Kullanma  ', value: 'Rütbe Aşımı ve Yetkiyi Kötüye Kullanma' },
          { name: 'Hiyerarşiyi Bozacak Davranış', value: 'Hiyerarşiyi Bozacak Davranış' }
        )
    ),
  run: async (client, interaction) => {
    if (interaction.channel.id !== "1271085579534209084") // Kanal ID
      return interaction.reply({
        content:
          ":information_source: **Bu komutu sadece <#1271085579534209084> kanalında kullanabilirsiniz!**",
        ephemeral: true,
      });

    const member = interaction.options.getMember("kişi");
    const sebep = interaction.options.getString("sebep");
    const roles = [
      // Komutu Kullanacak Rol IDleri
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
      "1272849570229129227", // Kamu Güvenlik Teşkilatı
      "1272849626155974706", // Kurucu
    ];

    if (!interaction.member.roles.cache.some(role => roles.includes(role.id))) {
      return interaction.reply({
        content: ":information_source: Yeterli rütbeniz bulunmamakta.",
        ephemeral: true,
      });
    }

    let roller = [
      "1272847964687175755", // TSK
      "1272848098523353168", // JGK
      "1272848101786255411", // PÖH
      "1272848009276821617", // EGM
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

    const hasRole = roller.some(rol => member.roles.cache.has(rol));

    if (!hasRole) {
      return interaction.reply({
        content: `:x: İşlemi gerçekleştirebilmek için **(${member})** bir birlik üyesi olması gerekmektedir.`,
        ephemeral: true,
      });
    }

    try {
      await member.setNickname('');

      for (const rol of roller) {
        if (member.roles.cache.has(rol)) {
          await member.roles.remove(rol);
        }
      }

      await interaction.reply({
        content: `**[${now}]** : **(${member})** personel gruptan **tasfiye** edilmiştir. || Sebep: __**${sebep}**__`,
        ephemeral: false,
      });

    } catch (error) {
      console.error(`Hata: ${error}`);
      await interaction.reply({
        content: `**[${now}]** : **(${member})** adlı klan üyesinin rolünü kaldırırken bir **hata oluştu.**`,
        ephemeral: true,
      });
    }
  },
};
