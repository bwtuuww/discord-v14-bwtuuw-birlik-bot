const { // bwtuuw
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("ilan")
    .setDescription("Araç ilanı vermenizi sağlar!"),
  run: async (client, interaction) => {

    if (!interaction.member.roles.cache.has("1272849626155974706"))
      return interaction.reply({
        content: ":information_source: Yeterli rütbeniz bulunmamakta.",
        ephemeral: true,
      });

    if (interaction.channel.id !== "1274736537841701018")
      return interaction.reply({
        content:
          ":information_source: Bu komutu sadece <#1274736537841701018> kanalında kullanabilirsiniz!",
        ephemeral: true,
      });
    let embed = new EmbedBuilder()
      .setTitle("Sahibinden.com") // bwtuuw
      .setImage(`https://i.hizliresim.com/2zd9rmi.gif`)
      .setDescription("\`\`\`Araç ilanı vermek mi istiyorsunuz? Hemen buradan başlayabilirsiniz!\`\`\`") // bwtuuw
      .setColor(Colors.Blurple);  // bwtuuw
    let button = new ButtonBuilder() // bwtuuw
      .setStyle(ButtonStyle.Primary) // bwtuuw
      .setLabel("Araç İlanı Ver")
      .setCustomId("ilan-ver"); // bwtuuw
    let link = new ButtonBuilder()
      .setLabel('Site Adresimiz')
      .setURL('https://www.youtube.com/watch?v=qn5Ir9ghdzk')
      .setStyle(ButtonStyle.Link);
      

      await interaction.reply({
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(button,link),
        ],
      });
  },
};
