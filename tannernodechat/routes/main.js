const express = require('express')
const router = express.Router()

const { restrict, restrict_joined } = require('./restrictions')
const path = require('path')
const { existsSync } = require('fs')

router.get('/assets/:asset', restrict, (req, res) => {
	const p = path.normalize(req.params.asset).replace(/^(\.\.(\/|\\|$))+/, '')
	const filePath = path.resolve('assets/'+p)
	if (!existsSync(filePath)) {
		return res.redirect('/')
	}
	res.sendFile(filePath)
})

router.get('/chat', restrict, restrict_joined, (req, res, next) => {
	res.render('chat')
})

router.get('/join', restrict, function (req, res) {
	const room = req.query.room
	if (room) {
		req.session.user.room = room
		return res.redirect('/chat')
	}
	res.render('join')
})

module.exports = router