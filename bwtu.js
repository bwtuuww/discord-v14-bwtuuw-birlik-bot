const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.User,
  ],
});

const config = require("./src/config.js");
const { readdirSync } = require("fs");
const moment = require("moment");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const token = config.token;

client.commands = new Collection();
const rest = new REST({ version: "10" }).setToken(token);

const log = (l) => {
  console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`);
};

// MongoDB bağlantısı
const mongodb = require("./src/mongodb/mongoose.js");
mongodb();

const Role = require("./src/mongodb/rolesSchema.js");


const commands = [];
readdirSync("./src/commands").forEach(async (file) => {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
});

client.on("ready", async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
  log(`${client.user.username} Aktif Edildi!`);
});



client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'bilgi-al') {
    try {
      await interaction.reply({
        content: `**[Önemli Duyuru]**

Merhaba,

Bu mesaj, butona tıkladığınızda gönderilen uzun bir bilgilendirme mesajıdır. Burada, önemli bilgileri ve talimatları detaylı bir şekilde açıklayabiliriz.

**1. Bilgi 1:**
Burada bilgilendirme metni olacak. Bu bilgi hakkında detaylı açıklama yapılacak.

**2. Bilgi 2:**
Burada diğer bilgilendirme metni olacak. Bu bilgi hakkında detaylı açıklama yapılacak.

**3. Bilgi 3:**
Burada başka bilgilendirme metni olacak. Daha fazla detaylı açıklama yapılacak.

Lütfen yukarıdaki bilgileri dikkatlice okuyun ve gerekli adımları takip edin.

Teşekkür ederiz!`,
        ephemeral: true
      });
    } catch (error) {
      console.error(":warning: Mesaj gönderilirken bir hata oluştu:", error);
    }
  }
});







client.on('guildMemberRemove', async member => {
  try {
    const role = member.roles.cache.first(); 
    if (!role) {// bwtuuw
      console.log(`Kullanıcı ${member.displayName} (${member.id}) herhangi bir role sahip değil.`);
      return;
    }// bwtuuw

    await Role.updateOne(
      { userID: member.id },
      { roleID: role.id, username: member.displayName },// bwtuuw
      { upsert: true }
    );
    console.log(`Kullanıcı ${member.displayName} (${member.id}) rol ${role.id} ile MongoDB'ye kaydedildi.`);// bwtuuw
  } catch (error) {
    console.error(":information_source: Rol ve isim kaydedilirken bir hata oluştu:", error);
  }
});
// bwtuuw

client.on('guildMemberAdd', async member => {
  try {
    const roleData = await Role.findOne({ userID: member.id });
    if (roleData) {
      const role = member.guild.roles.cache.get(roleData.roleID);
      if (role) {
        await member.roles.add(role);
        await member.setNickname(roleData.username);
        console.log(`Kullanıcı ${roleData.username} (${member.id}) rol ${roleData.roleID} ile geri yüklendi.`);
      }// bwtuuw
      await Role.deleteOne({ userID: member.id }); 
    } else {
      console.log(`Kullanıcı ${member.displayName} (${member.id}) için kayıt bulunamadı.`);// bwtuuw
    }
  } catch (error) {
    console.error(":information_source: Kullanıcı tekrar katıldığında rol ve isim geri yüklenirken bir hata oluştu:", error);
  }
});
// bwtuuw

client.on('interactionCreate', async interaction => {// bwtuuw
  if (!interaction.isButton()) return;

  if (interaction.customId === 'logMessageButton') {
    try {
      await interaction.reply({
        content: `**[Önemli Duyuru]**// bwtuuw

Merhaba,

Bu mesaj, butona tıkladığınızda gönderilen uzun bir bilgilendirme mesajıdır. Burada, önemli bilgileri ve talimatları detaylı bir şekilde açıklayabiliriz.

**1. Bilgi 1:**
Burada bilgilendirme metni olacak. Bu bilgi hakkında detaylı açıklama yapılacak.

**2. Bilgi 2:**
Burada diğer bilgilendirme metni olacak. Bu bilgi hakkında detaylı açıklama yapılacak.

**3. Bilgi 3:**
Burada başka bilgilendirme metni olacak. Daha fazla detaylı açıklama yapılacak.

Lütfen yukarıdaki bilgileri dikkatlice okuyun ve gerekli adımları takip edin.

Teşekkür ederiz!`,
        ephemeral: true
      });
    } catch (error) {
      console.error(":warning: Mesaj gönderilirken bir hata oluştu:", error);
    }
  }
});

readdirSync("./src/events").forEach(async (file) => {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));// bwtuuw
  }
});

process.on("unhandledRejection", (e) => {
  console.log(e);
});
process.on("uncaughtException", (e) => {
  console.log(e);
});
process.on("uncaughtExceptionMonitor", (e) => {
  console.log(e);
});// bwtuuw

client.login(token);
