const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user')

exports.signup = (req, res, next) => {
    let regexEmail = /^[a-zA-Z0-9_.-]+\@+[a-zA-Z0-9]+\.+[a-z]{2,4}$/;
    let regexPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

    if (!regexEmail.test(req.body.email)) {
        res.status(401).json({ message: 'Please check your entry and rewrite your email address' });

    } else if (!regexPass.test(req.body.password)) {
        res.status(401).json({ message: 'Your password must consist of 8 characters including an uppercase, a lowercase and a special character' });

    } else {   
        bcrypt.hash(req.body.password, 10) // hash password to save it securely to the database
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'User has been created !' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    }
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'User not found !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Incorrect password !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
