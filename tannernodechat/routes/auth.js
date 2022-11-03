const express = require('express')
const router = express.Router()

const functions = require('../database/functions')
const { unrestricted } = require('./restrictions')



router.get('/', unrestricted, (_, res) => {
	res.redirect('/login') // if not logged in, redirect to /login
})
router.get('/login', unrestricted, function (req, res) {
	res.render('login')
})
router.get('/signup', unrestricted, (req, res) => {
	res.render('signup')
})

router.post('/signup', async (req, res, next) => {
	if (!req.body.username || !req.body.password) {
		req.session.error = 'Missing queries.'
		return res.redirect('/signup')
	}
	if (req.body.password != req.body.repeat_password) {
		req.session.error = 'Passwords do not match.'
		return res.redirect('/signup')
	}
	const success = await functions.Register(req.body.username, req.body.password)

	if (success) {
		req.session.regenerate(function () {
			req.session.success = 'Signed up! Please login.'
			res.redirect('/login')
		})
	} else {
		req.session.error = 'Sign up failed, please try again.'
		res.redirect('/signup')
	}
})

router.post('/login', async function (req, res, next) {
	const success = await functions.Login(req.body.username, req.body.password)

	if (success) {
		req.session.regenerate(function () {
			req.session.user = {
				name: req.body.username
			}
			req.session.success = 'Authenticated as ' + req.body.username
			res.redirect('/join')
		})
	} else {
		req.session.error = 'Authentication failed, please check your username and password.'
		res.redirect('/login')
	}
})


router.get('/logout', function (req, res) {
	delete req.session.user
	req.session.error = 'Logged out!'
	res.redirect('/login')
})

module.exports = router