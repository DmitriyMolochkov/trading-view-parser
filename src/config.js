require('dotenv').config();

const {
  WATCH_LIST_NUMBER = 14561151,
  SERVER_PORT = 9000
} = process.env;

module.exports = {
  WATCH_LIST_NUMBER,
  SERVER_PORT,
};