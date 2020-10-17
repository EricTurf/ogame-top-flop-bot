const Discord = require("discord.js");
const cron = require("node-cron");

const { setServerConfig, getServerConfigs } = require("./server-config");
const { takeAllianceScreenshot } = require("./screenshot");

const client = new Discord.Client();

const topFlopCommand = "bot style topflop jutsu";

const cronExpression = "00 10 * * *";

client.on("ready", () => {
  console.log("I am ready!");

  cron.schedule(cronExpression, async () => {
    const channels = client.channels.cache;
    for (const config of getServerConfigs()) {
      const { guildId, id } = config;
      console.log(`Looking to post top/flop for guild ${guildId}`);
      const path = await takeAllianceScreenshot(guildId, id);

      const serverChannels = channels.filter(
        (ch) => ch.guild.id === guildId && config.channels.includes(ch.name)
      );

      console.log(
        `For guild ${guildId}. Found ${
          serverChannels.size
        } channels to post in. Configured channels are ${config.channels.join(
          ", "
        )}`
      );

      serverChannels.each((ch) =>
        ch.send("Top/flop for the day", {
          files: [`./${path}`],
        })
      );
    }
  });
});

client.on("message", async (message) => {
  if (message.content.includes(topFlopCommand)) {
    const guildId = message.guild.id;

    const content = message.content.replace(topFlopCommand, "").trim();

    const [id, channelList] = content.split(" ");

    setServerConfig(guildId, id, channelList.split(","));

    try {
      const path = await takeAllianceScreenshot(guildId, id);

      message.channel.send(
        `I have set your alliance top/flop id as \`${id}\`.\nBelow is what will be posted everyday.\nIf the embedded image does not work. Verify you provided the right id and rerun the command`,
        {
          files: [`./${path}`],
        }
      );
    } catch (error) {
      console.error("Error trying to take screenshot", error);
    }
  }
});

client.login(process.env.BOT_TOKEN);
