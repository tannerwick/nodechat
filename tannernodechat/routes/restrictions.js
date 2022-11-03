


function restrict(req, res, next) {
	if (req.session.user) {
		next()
	} else {
		req.session.error = 'Access denied!'
		res.redirect('/login')
	}
}

function restrict_joined(req, res, next) {
	if (req.session.user.room) {
		next()
	} else {
		req.session.error = 'You havent joined a room.'
		res.redirect('/join')
	}
}

function unrestricted(req,res,next) {
	if (req.session.user) {
		return res.redirect('/join')
	}
	next()
}

module.exports = {
    restrict,
    restrict_joined,
    unrestricted
}