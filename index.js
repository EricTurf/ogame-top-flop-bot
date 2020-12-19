const Discord = require("discord.js");
const cron = require("node-cron");

const {
  setServerConfig,
  getServerConfigs,
  getServerConfigByProfileName,
  deleteServerConfigByProfileName,
} = require("./services/server-config");

const { takeAllianceScreenshot } = require("./services/screenshot");
const { connect } = require("./mongo");

const client = new Discord.Client();

const makeCommand = (cmd) => `bot style ${cmd} jutsu`;

const topFlopCommand = makeCommand("topflop");
const showConfigCommand = makeCommand("show");
const deleteConfigCommand = makeCommand("delete");

const cronExpression = "00 1 * * *";

const BOT_USER_NAME = "ogame-top-flop-bot";

client.on("ready", async () => {
  console.log("I am ready!");
  console.log("Connecting to mongo db");

  // Connect to the mongodb
  await connect();

  cron.schedule(cronExpression, async () => {
    console.log("Running scheduled job");
    const channels = client.channels.cache;
    for (const config of await getServerConfigs()) {
      const { guildId, profileName, topflopId } = config;
      console.log(`Looking to post top/flop for guild ${guildId}`, topflopId);
      const path = await takeAllianceScreenshot(
        profileName,
        guildId,
        topflopId
      );

      const serverChannels = channels.filter(
        (ch) => ch.guild.id === guildId && config.channels.includes(ch.id)
      );

      console.log(
        `For profile ${profileName} in guild ${guildId}. Found ${
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

  if (message.content.includes(topFlopCommand)) {
    const guildId = message.guild.id;

    const content = message.content.replace(topFlopCommand, "").trim();

    const [profileName, id, ...channels] = content.split(" ");

    const channelIds = channels.join().match(/(?<=<#).*?(?=>)/g);

    setServerConfig(profileName, guildId, id, channelIds);

    try {
      const path = await takeAllianceScreenshot(profileName, guildId, id);

      const embed = new Discord.MessageEmbed()
        .setDescription(
          `I have set your alliance top/flop id as \`${id}\`.\nAbove is what will be posted everyday.\nIf the embedded image does not work. Verify you provided the right id and rerun the command`
        )
        .setImage("https://media.giphy.com/media/mu7RhFWLcfj9u/giphy.gif");

      embed.files = [`./${path}`];

      message.channel.send(embed);
    } catch (error) {
      console.error("Error trying to take screenshot", error);
    }
  }

  if (message.content.includes(showConfigCommand)) {
    const guildId = message.guild.id;
    const content = message.content.replace(showConfigCommand, "").trim();

    const [profileName] = content.split(" ");

    const config = await getServerConfigByProfileName(
      `${profileName}-${guildId}`
    );

    let gif = "https://media.giphy.com/media/11zJJ7RVfql2tq/giphy.gif";
    let response = `You did not set this profile for this server yet.\nYou can do that by using the following command\n\`bot style topflop jutsu ${profileName} ID CHANNEL_LIST\``;

    if (config !== null) {
      response = `I have found a config for your server.\nThe current id is \`${config.topflopId}\``;

      gif = "https://media.giphy.com/media/jqz7aAQmbbMDS/giphy.gif";
    }

    const embed = new Discord.MessageEmbed()
      .setImage(gif)
      .setDescription(response);

    message.channel.send(embed);
  }

  if (message.content.includes(deleteConfigCommand)) {
    const guildId = message.guild.id;
    const content = message.content.replace(deleteConfigCommand, "").trim();

    const [profileName] = content.split(" ");

    const config = await getServerConfigByProfileName(
      `${profileName}-${guildId}`
    );

    if (config === null) {
      message.channel.send("I cannot delete what does not exist");
    } else {
      try {
        await deleteServerConfigByProfileName(`${profileName}-${guildId}`);

        message.channel.send(
          new Discord.MessageEmbed()
            .setImage("https://media.giphy.com/media/RQjo6hWLt0PpS/giphy.gif")
            .setDescription(
              "I have successfully destroyed the config for your server"
            )
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
