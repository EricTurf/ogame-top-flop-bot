const ServerConfigModel = require("../model/server-config");

const setServerConfig = async (guildId, id, channels) => {
  const existingServerConfig = await getServerConfigByGuildId(guildId);

  if (existingServerConfig === null) {
    console.log(`No server config for guild ${guildId}. Creating a new one`);
    const serverConfig = new ServerConfigModel({
      guildId,
      topflopId: id,
      channels,
    });

    return serverConfig.save();
  } else {
    console.log(
      `Found server config for guild ${guildId}. Updating with new topflopId ${id}`
    );

    existingServerConfig.topflopId = id;

    return existingServerConfig.save();
  }
};

const getServerConfigs = () => ServerConfigModel.find({});

const getServerConfigByGuildId = (guildId) =>
  ServerConfigModel.findOne({ guildId });

const deleteServerConfigByGuildId = (guildId) =>
  ServerConfigModel.deleteOne({ guildId });

module.exports = {
  setServerConfig,
  getServerConfigs,
  getServerConfigByGuildId,
  deleteServerConfigByGuildId,
};
