let configs = [];

const setServerConfig = (guildId, id, channels) => {
  const config = { guildId, id, channels };
  if (configs.length === 0) {
    configs = [...configs, config];
  } else {
    const index = configs.findIndex((c) => c.guildId === guildId);

    if (index === -1) {
      configs = [...configs, config];
    } else {
      configs[index] = config;
    }
  }
};

const getServerConfigs = () => configs;

module.exports = {
  setServerConfig,
  getServerConfigs,
};
