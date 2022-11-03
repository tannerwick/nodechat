require('dotenv').config()


const express = require('express')
const path = require('path')
const mongoStore = require('connect-mongo')
const expressSession = require('express-session')

const SessionConfig = {
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: '6XNpCuCEGFFgZQGiaZTtBwLhuHWfoy',
	store: new mongoStore({
		ttl: 14 * 24 * 60 * 60,
		mongoUrl: process.env.mongo_uri
	})
}

require("./database/connect")(express);

const app = express()
const server = require('http').createServer(app)

const session = expressSession(SessionConfig)

// config

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// middleware

app.use('/', express.static(__dirname + '/views/'));
app.use(express.urlencoded({
	extended: false
}))
app.use(session)

require('./routes/sockets')(server, session)

app.use(function (req, res, next) {
	const err = req.session.error
	const msg = req.session.success
	delete req.session.error
	delete req.session.success
	res.locals.message = ''
	if (err) res.locals.message = '<p class="msg error">' + err + '</p>'
	if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>'
	next()
})


app.use('/', require('./routes/auth')) // initialize auth routes
app.use('/', require('./routes/main')) // initialize main routes


process.on('uncaughtException', function (err) {
	console.log('Caught exception: ', err);
})
server.listen(process.env.PORT || 3000, () => {
	console.log(`[!] Express server running on port (${process.env.PORT || 3000})`)
})