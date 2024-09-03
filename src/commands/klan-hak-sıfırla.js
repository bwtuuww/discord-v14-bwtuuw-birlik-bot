const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Klan = require("../mongodb/KlanSchema.js");
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("klan-hak-sıfırla")
    .setDescription("Bir kullanıcıyı klandan çıkartırsınız!")
    .addUserOption((option) =>
      option
        .setName("kullanıcı")
        .setDescription("Bir kullanıcı seçin")
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const user = interaction.options.getUser("kullanıcı"); 

    if (!interaction.member.roles.cache.has("1272849626155974706"))
      return interaction.reply({
        content: ":information_source: Bu komutu kullanamazsın tekrar deneme.",
        ephemeral: true,
      });

    async function resetHak(KlanUser) {
      try {
        const klan = await Klan.findOneAndUpdate(
          { KlanUser },
          { hak: 0 }, // Hak değerini 0 olarak ayarlar
          { upsert: true }
        );

        interaction.reply({
          content: `**[${now}]** : **(**${user}**)** Adlı personelin tüm hakları sıfırlanmış ve tekrar değerlendirmeye alınmıştır.`,
        });
      } catch (error) {
        interaction.reply({
          content: ":information_source: Hak sıfırlanırken bir **hata oluştu**",
          ephemeral: true,
        });
      }
    }

    resetHak(user.id);
  },
};
