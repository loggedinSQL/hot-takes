const rateLimit = require('express-rate-limit');

const createAccountLimiter = rateLimit({ // limit to 5 create account requests per hour
	windowMs: 60 * 60 * 1000,
	max: 5, 
	message: 'Too many accounts created from this IP, please try again after an hour',
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = rateLimit(createAccountLimiter);
