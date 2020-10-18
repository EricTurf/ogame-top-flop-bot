const Discord = require("discord.js");
const cron = require("node-cron");

const {
  setServerConfig,
  getServerConfigs,
  getServerConfigByGuildId,
  deleteServerConfigByGuildId,
} = require("./services/server-config");

const { takeAllianceScreenshot } = require("./services/screenshot");
const { connect } = require("./mongo");

const client = new Discord.Client();

const topFlopCommand = "topflop";
const showConfigCommand = "show";
const deleteConfigCommand = "delete";

const makeCommand = (cmd) => `bot style ${cmd} jutsu`;

const cronExpression = "00 1 * * *";

const BOT_USER_NAME = "ogame-top-flop-bot";

client.on("ready", async () => {
  console.log("I am ready!");
  console.log("Connecting to mongo db");

  // Connect to the mongodb
  await connect();

  cron.schedule(cronExpression, async () => {
    const channels = client.channels.cache;
    for (const config of await getServerConfigs()) {
      const { guildId, topflopId } = config;
      console.log(`Looking to post top/flop for guild ${guildId}`, topflopId);
      const path = await takeAllianceScreenshot(guildId, topflopId);

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
  // Could be improved by fetching our bot user id on init and using that
  if (message.author.username === BOT_USER_NAME) {
    // Ignore our own message
    console.log("Message is from us. Ignoring");
    return;
  }

  if (message.content.includes(makeCommand(topFlopCommand))) {
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

  if (message.content.includes(makeCommand(showConfigCommand))) {
    const guildId = message.guild.id;

    const config = await getServerConfigByGuildId(guildId);

    let response = `You did not set me up for this server.\nYou can do that by using the following command\n\`bot style topflop jutsu ID CHANNEL_LIST\``;

    if (config !== null) {
      response = `I have found a config for your server.\nThe current id is \`${config.topflopId}\``;
    }

    message.channel.send(response);
  }

  if (message.content.includes(makeCommand(deleteConfigCommand))) {
    const guildId = message.guild.id;
    console.log("HJERE");

    const config = await getServerConfigByGuildId(guildId);

    if (config === null) {
      message.channel.send("I cannot delete what does not exist");
    } else {
      try {
        await deleteServerConfigByGuildId(guildId);

        message.channel.send(
          "I have successfully destroyed the config for your server"
        );
      } catch (e) {
        message.channel.send(
          "I have failed to destroy the config for your server. Sucks to suck."
        );
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
