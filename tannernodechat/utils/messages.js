const functions = require('../database/functions');

const generateMessage = (username, text, room = "") => {
//  functions.sendMessage(username, text, new Date().getDate() + new Date().getTime(), room)
  return {
    username,
    text,
    createdAt: new Date().getDate() + new Date().getTime(),
  };
};

const dbMessages = (username, text, createdAt) => {
  return {
    username,
    text,
    createdAt: createdAt,
  };
};

const generateUrlMessage = (username, url) => {
  return {
    username,
    url,
    createdAt:new Date().getDate() + new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateUrlMessage,
  dbMessages,
};
