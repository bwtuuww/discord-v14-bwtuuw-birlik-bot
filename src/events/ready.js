const { ActivityType } = require("discord.js"); // bwtu
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    let activities = [
        `bwtuuw tarafından geliştirildi`, // bwtuuw
        `${client.user.username}`, // bwtuuw
      ],
      i = 0;
    setInterval(
      () =>
        client.user.setActivity({
          name: `${activities[i++ % activities.length]}`,
          type: ActivityType.Listening, // bwtu
        }),
      22000
    ); // bwtu
  },
};
