const mongoose = require("mongoose");
const { config } = require("dotenv");
// load env variables
config();

const { DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const connectionString = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.d2klu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const connect = () =>
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Successfully connected to mongoDB"))
    .catch((err) =>
      console.error(
        "The following error occured when trying to connect to mongoDB",
        err
      )
    );

module.exports = {
  connect,
};
