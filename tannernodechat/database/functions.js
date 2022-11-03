const mongoose = require("mongoose");
const messageSchema = require("./models/messages");
const usersSchema = require("./models/users");
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function sendMessage(username, message, createdAt, room) {
  if(username == "System") { return }
  const addMessage = await new messageSchema({
    username: username,
    message: message,
    createdAt: createdAt,
    room: room
  }).save();
}

async function grabMessages(room) {
    const query = await messageSchema.find({
        room: room
    });

    if(query) {
      return query;
    }
    else {
	return;
    }
}

async function Login(username, password) {
  let query = (await usersSchema.find({
    username: username
  }))[0]
  if(query) {
    const hashed = query.password;
    const check = bcrypt.compare(password, hashed);
    if(check) {
      return true;
    } else {
      return false;
    }
  }
  return false
}

async function Register(username, password) {
  const query = (await usersSchema.find({
    username: username
  }))[0]

  if(query) {
    return false;
  } else {
    let hashed = await bcrypt.hash(password, saltRounds);
    await new usersSchema({
      username: username, 
      password: hashed,
      admin: 0
    }).save()
    return true
  }  
}

module.exports = {
  sendMessage,
  grabMessages,
  Login,
  Register
}
