const {// bwtuuw
    EmbedBuilder,// bwtuuw
    PermissionsBitField,
    Colors,// bwtuuw
  } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");// bwtuuw
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');
// bwtuuw
const whitelistRoles = [ 
    "1272849626155974706", 
    "1272849570229129227", // bwtuuw
    "1272848274528665721"
];

const kompanelSeviyeleri = [
    { name: "[T.S.K] Elmas", value: "1272848274528665721" },
    { name: "[T.S.K] Altın", value: "1272848283257147496" },
    { name: "[T.S.K] Bronz", value: "1272848285652221952" },// bwtuuw
    { name: "[J.G.K] Elmas", value: "1272848286302077040" },// bwtuuw
    { name: "[J.G.K] Altın", value: "1272848286629367822" },
    { name: "[J.G.K] Bronz", value: "1272848288386908191" },// bwtuuw
    { name: "[E.G.M] Elmas", value: "1272848614737051721" },// bwtuuw
    { name: "[E.G.M] Altın", value: "1272848620571459585" },
    { name: "[E.G.M] Bronz", value: "1272848623633174610" },
    { name: "[P.Ö.H] Elmas", value: "1272848725936570412" },
    { name: "[P.Ö.H] Altın", value: "1272848740213981226" },// bwtuuw
    { name: "[P.Ö.H] Bronz", value: "1272848743582007409" }
];

const kontrolrolid = [ // bwtuuw
    "1272847964687175755", 
    "1272848098523353168", // bwtuuw
    "1272848009276821617", // bwtuuw
    "1272848101786255411" 
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kompanel")// bwtuuw
    .setDescription("Bir kullanıcıya rol atar veya rol alır.")
    .addUserOption(option => // bwtuuw
      option.setName("kişi")
        .setDescription("Rol atanacak veya alınacak kullanıcı")// bwtuuw
        .setRequired(true)
    )
    .addStringOption(option => // bwtuuw
      option.setName("işlem")
        .setDescription("Rol vermek veya almak için işlem seçeneği")
        .addChoices(// bwtuuw
          { name: "Ver", value: "ver" },// bwtuuw
          { name: "Al", value: "al" }// bwtuuw
        )
        .setRequired(true)// bwtuuw
    )
    .addStringOption(option => // bwtuuw
      option.setName("rol")
        .setDescription("Verilecek veya alınacak rol")// bwtuuw
        .addChoices(...kompanelSeviyeleri)
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const user = interaction.options.getUser("kişi");
    const roleId = interaction.options.getString("rol");// bwtuuw
    const action = interaction.options.getString("işlem");
    const logChannelId = "1274807887822192715"; // Log mesajlarının gönderileceği kanalın ID'si

if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
  return interaction.reply({
    content: ":warning: Bu işlem için gerekli yetkilere sahip değilim.",
    ephemeral: true,// bwtuuw
  });
}
    
    if (!whitelistRoles.some(role => interaction.member.roles.cache.has(role))) {
      return interaction.reply({
        content: ":information_source: Bu komutu kullanma yetkiniz bulunmamakta.",
        ephemeral: true,
      });
    }// bwtuuw

    if (user.id === interaction.user.id && action === "ver") {
      return interaction.reply({
        content: ":warning: Kendi rolünüzü kendinize veremezsiniz.",
        ephemeral: true,
      });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: ":warning: Kullanıcı bulunamadı.", // bwtuuw
        ephemeral: true,
      });
    }

    const userRoles = member.roles.cache.map(role => role.id);

    const logEmbed = new EmbedBuilder()// bwtuuw
    .setColor(Colors.DarkGrey)
    .setTitle(`Rol İşlemi Logu`)
    .addFields(
      { name: "İşlem", value: `\`\`\`${action === "ver" ? "Rol Verme" : "Rol Alma"}\`\`\``, inline: true },
      { name: "Kullanıcı", value: `\`\`\`${user.id}\`\`\``, inline: true },
      { name: "Tarih", value: `\`\`\`${now}\`\`\``, inline: true }
    );
  

    if (action === "ver") {
      const hasValidRole = userRoles.some(role => kontrolrolid.includes(role));

      if (!hasValidRole) {
        return interaction.reply({
          content: ":warning: Kullanıcının belirtilen rollere sahip olmadan rol verilmez.",
          ephemeral: true,
        });
      } // bwtuuw

      const categoryRoles = kompanelSeviyeleri.map(role => role.value);
      const existingRole = userRoles.find(role => categoryRoles.includes(role));

      if (existingRole) {
        try {
          await member.roles.remove(existingRole);
        } catch (error) {
          console.error(error);
          return interaction.reply({
            content: ":x: Mevcut rolü kaldırırken bir hata oluştu.",
            ephemeral: true,
          });
        }
      }

      const role = interaction.guild.roles.cache.get(roleId); // bwtuuw
      if (!role) {
        return interaction.reply({
          content: ":warning: Rol bulunamadı.",
          ephemeral: true,
        });
      }

      try {
        await member.roles.add(role); // bwtuuw
        logEmbed
          .addFields(
            { name: "Verilen Rol", value: `\`\`\`${role.name}\`\`\``, inline: true },
            { name: "Veren Kişi", value: `\`\`\`${interaction.user.id}\`\`\``, inline: true }
          );// bwtuuw

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          logChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({
          content: `**[${now}]** : Tebrikler! **(<@${user.id}>)** **(${role.name})** seviyesine terfi edildi.`,
        });
      } catch (error) {// bwtuuw
        console.error(error);
        return interaction.reply({
          content: ":x: Rol eklenirken bir hata oluştu.",
          ephemeral: true,
        });
      }
    } else if (action === "al") {
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        return interaction.reply({// bwtuuw
          content: ":warning: Rol bulunamadı.",
          ephemeral: true,
        });
      }// bwtuuw

      try {
        await member.roles.remove(role);
        logEmbed
        .addFields(
            { name: "Alınan Rol", value: `\`\`\`${role.name}\`\`\``, inline: true },
            { name: "Alan Kişi", value: `\`\`\`${interaction.user.id}\`\`\``, inline: true }
          );

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {// bwtuuw
          logChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({
          content: `**[${now}]** : **<@${user.id}>** **(${role.name})** rolü başarıyla alındı.`,
        });
      } catch (error) {
        console.error(error);// bwtuuw
        return interaction.reply({
          content: ":x: Rol kaldırılırken bir hata oluştu.",
          ephemeral: true,
        });
      }// bwtuuw
    }
  },
};
// bwtuuw