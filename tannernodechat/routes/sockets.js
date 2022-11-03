
const {
	generateMessage,
	generateUrlMessage,
	dbMessages
} = require('../utils/messages')

const {
	grabMessages
} = require('../database/functions')

const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const rooms = {}

function isInRoom(room, username) {
    if (!rooms[room]) return false
    if (rooms[room].length == 0) {
        delete rooms[room]
        return false
    }
    for (let i = 0; i < rooms[room].length; i++) {
        if (rooms[room][i].username == username) {
            return true
        }
    }
    return false
}
function addToRoom(room, username) {
    if (!rooms[room]) {
        rooms[room] = [{
            username
        }]
    }
    if (isInRoom(room, username)) return // already added, dont add
    rooms[room].push({
        username
    })
}
function removeFromRoom(room, username) {
    if (!isInRoom(room, username)) return
    for (let i = 0; i < rooms[room].length; i++) {
        if (rooms[room][i].username == username) {
            rooms[room].splice(i, 1)
            if (rooms[room].length == 0) {
                delete rooms[room]
            }

            return i
        }
    }
}

module.exports = (server, session) => {
    const io = require('socket.io')(server, {
        maxHttpBufferSize: 75000000 // 75 MB
    })

    io.use(require('express-socket.io-session')(session))

    io.on('connection', socket => {

        socket.on('Hello!', async callback => {
            const user = socket.handshake.session.user
            if (!user) return callback('Please log in.')
            const room = user.room
            if (!room) return callback('Please join a room.')

            addToRoom(room, user.name)
            
            socket.join(room);

            const messages = await grabMessages(room);
            io.to(room).emit(
                "message",
                generateMessage("System", `${user.name} has joined!`)
            );

            messages.forEach((messageDB) => {
                socket.emit(
                    "message",
                    dbMessages(messageDB.username, messageDB.message, messageDB.createdAt)
                );
            });
            io.to(room).emit("roomData", {
                room,
                users: rooms[room],
            });

            callback()
        })

        socket.on('sendMessage', (message, callback) => {
            const user = socket.handshake.session.user
            if (!user) return callback('Please log in.')
            const room = user.room
            if (!room) return callback('You are not in a room.')
            if (message.trim() == '' || !message) return callback('Please enter a message.')
            if (message.length > 500) return callback('Message is too long.')
    
    
            io.to(room).emit('message', generateMessage(user.name, message, room))
    
            callback()
        })

        socket.on('sendLocation', (coords, callback) => {
            if (typeof coords !== 'object' || !coords.latitude || !coords.longitude) return callback('Missing parameters.')
            const user = socket.handshake.session.user
            if (!user) return callback('Please log in.')
            if (!user.room) return callback('Please join a room.')
            
            io.to(user.room).emit(
                "locationMessage",
                generateUrlMessage(
                    user.name,
                    `https://google.com/maps?q=${coords.latitude.toString()},${coords.longitude.toString()}`
                )
            );
            callback();
        })

        socket.on('attachFile', async (file, name, callback) => {
            const user = socket.handshake.session.user
            if (!user) return callback('Please log in.')
            if (!user.room) return callback('Please join a room.')
            
            const uid = uuidv4()
            const fileType = name.split('.').pop()

            await fs.writeFileSync(__dirname + `\\..\\assets\\${uid}.${fileType}`, file)
            
            io.to(user.room).emit(
                'file',
                name,
                generateUrlMessage(
                    user.name,
                    `./assets/${uid}.${fileType}`)
            )

            callback()
        })

        socket.on('disconnect', () => {
            const user = socket.handshake.session.user
            if (!user) return
            if (!user.room) return 

            const room = user.room
            const users = rooms[room]

            removeFromRoom(room, user.name)

            io.to(room).emit(
                "message",
                generateMessage("System", `${user.name} has left.`)
            );
            io.to(user.room).emit("roomData", {
                room: room,
                users: users,
            });
        })
    })
}