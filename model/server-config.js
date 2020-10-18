const mongoose = require("mongoose");

const serverConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: [true, "Must provide a guild id"],
  },
  topflopId: {
    type: String,
    required: [true, "Must provide a MMORPG id"],
  },
  channels: { type: [String], required: true },
});

module.exports = mongoose.model("ServerConfig", serverConfigSchema);
