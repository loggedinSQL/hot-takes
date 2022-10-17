const rateLimit = require('express-rate-limit');

const limitReached = (req, res) => { // what to do when our maximum request rate is breached
	log.warn({ ip: req.ip }, 'Rate limiter triggered');
	renderError(req, res); // function to render an error page
}

const createAccountLimiter = rateLimit({ // limit to 5 create account requests per hour
	windowMs: 60 * 60 * 1000,
	max: 5,
	message: 'Too many accounts created from this IP, please try again after an hour',
	standardHeaders: true,
	legacyHeaders: false,
	onLimitReached: limitReached, // called once when max is reached
	handler: limitReached, // called for each subsequent request once max is reached
});

module.exports = rateLimit(createAccountLimiter);
