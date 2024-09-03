const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require("../config.js");
const User = require("../mongodb/Schema.js");
const Klan = require("../mongodb/KlanSchema.js");
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');

async function updateNicknameInMongoDB(userID, newNickname) {
  try {
    const user = await User.findOne({ userID: userID });
    if (!user) {
      return console.error(":information_source: Kullanıcı bulunamadı.");
    }

    const originalNickname = user.username;
    if (originalNickname === newNickname) {
      return console.error(":information_source: Kullanıcı adı zaten bu şekilde kayıtlı.");
    }

    await User.updateOne(
      { userID: userID },
      { $set: { username: newNickname } }
    );
  } catch (error) {
    console.error(":information_source: İşlem sırasında bir hata oluştu:", error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birlik")
    .setDescription("Bir kişiyi birliğe atarsınız!")
    .addUserOption((option) =>
      option
        .setName("kişi")
        .setDescription("Birliğe eklenecek üyeyi seçiniz!")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("birlik")
        .setDescription("Birliği seçiniz!")
        .setRequired(true)
        .addChoices(
          { name: "TSK", value: "TSK" },
          { name: "EGM", value: "EGM" },
          { name: "JGK", value: "JGK" },
          { name: "PÖH", value: "PÖH" },
        )
    )
    .addStringOption((option) =>
      option
        .setName("isim")
        .setDescription("Kullanıcı ismini girin")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("rütbe")
        .setDescription("Kullanıcı rütbesini girin!")
        .setRequired(true)
    ),

  run: async (client, interaction) => {
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

    if (interaction.channel.id !== "1271085579534209084")
      return interaction.reply({
        content:
          ":information_source: Bu komutu sadece <#1271085579534209084> kanalında kullanabilirsiniz!",
        ephemeral: true,
      });

    const user = interaction.options.getMember("kişi");
    const birlik = interaction.options.getString("birlik");
    const isim = interaction.options.getString("isim");
    const yeniRütbe = interaction.options.getString("rütbe");

    let roller = [
      {
        birlik: "TSK",
        id: "1272847964687175755",
      },
      {
        birlik: "EGM",
        id: "1272848009276821617",
      },
      {
        birlik: "JGK",
        id: "1272848098523353168",
      },
      {
        birlik: "PÖH",
        id: "1272848101786255411",
      },
    ];

    let nickname = user.displayName;
    async function addUserAndUpdateHistory(userID, newUsername, staff) {
      try {
        await User.updateOne(
          { userID: userID },
          {
            $push: {
              usernameHistory: { username: newUsername, staffID: staff },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error(":information_source: İşlem sırasında bir hata oluştu:", error);
      }
    }


    let hasReplied = false;

    async function incrementHak(KlanUser) {
      try {
        let KlanSorgu = await Klan.findOne({ KlanUser: KlanUser });
        let data = KlanSorgu ? KlanSorgu.hak || 0 : 0;

        if (data >= 3) {
          if (!hasReplied) {
            await interaction.reply({
              content: `:information_source: **(${user.displayName})** Adlı personelin Klana katılma talebi reddedildi. Klan giriş kapasitesi dolmuş durumda.`,
              ephemeral: true,
            });
            hasReplied = true;
          }
          return;
        }

        await Klan.updateOne(
          { KlanUser: KlanUser },
          { $inc: { hak: 1 } },
          { upsert: true }
        );

        const newNickname = `[${birlik}]${isim}[${yeniRütbe}]`;
        await user.setNickname(newNickname);
        await addUserAndUpdateHistory(KlanUser, newNickname, interaction.user.id);

        if (!hasReplied) {
          const button = new ButtonBuilder()
            .setLabel('Rütbe Ayrıntıları')
            .setCustomId('logMessageButton')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:askerremovebgpreview:1273327886274793662> ');

          const row = new ActionRowBuilder().addComponents(button);

          await interaction.reply({
            content: `**[${now}]** : **(${user})**, (**${birlik}**) birimine dahil oldu. Kimlik bandı (**${user.displayName}**) olarak belirlendi ve (**${yeniRütbe}**) rütbesine atandı. **(Klan Hakkı : ${data + 1})**`,
            components: [row],
          });
          hasReplied = true;
        }

        const secilenBirlik = roller.find((item) => item.birlik === birlik);
        if (secilenBirlik) {
          await user.roles.add(secilenBirlik.id);
        }

        await logUserAddition(user, birlik, isim, yeniRütbe);

      } catch (error) {
        console.error(":information_source: Hak artırılırken bir hata oluştu:", error);
        if (!hasReplied) {
          await interaction.reply({
            content: ":warning: İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
            ephemeral: true,
          });
          hasReplied = true;
        }
      }
    }

    if (nickname.includes(birlik)) {
      interaction.reply({
        content: `**[${now}]** : **(${user})** Adlı personel zaten bu birliğe atanmış. Eklemeye çalışmak gereksizdir.`,
        ephemeral: true,
      });
    } else {
      await incrementHak(user.id);
    }
  },
};
