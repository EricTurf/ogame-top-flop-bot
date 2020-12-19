const ServerConfigModel = require("../model/server-config");

const setServerConfig = async (profileName, guildId, id, channels) => {
  const existingServerConfig = await getServerConfigByProfileName(
    `${profileName}-${guildId}`
  );

  if (existingServerConfig === null) {
    console.log(
      `No server config for profile ${profileName}. Creating a new one`
    );
    const serverConfig = new ServerConfigModel({
      profileName: `${profileName}-${guildId}`,
      guildId,
      topflopId: id,
      channels,
    });

    return serverConfig.save();
  } else {
    console.log(
      `Found server config for profile ${profileName} in server ${guildId}. Updating with new topflopId ${id}`
    );

    existingServerConfig.topflopId = id;

    return existingServerConfig.save();
  }
};

const getServerConfigs = () => ServerConfigModel.find({});

const getServerConfigByProfileName = (profileName) =>
  ServerConfigModel.findOne({ profileName });

const deleteServerConfigByProfileName = (profileName) =>
  ServerConfigModel.deleteOne({ profileName });

module.exports = {
  setServerConfig,
  getServerConfigs,
  getServerConfigByProfileName,
  deleteServerConfigByProfileName,
};
