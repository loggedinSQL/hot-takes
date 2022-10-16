const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Saved !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) { // only the user who created the sauce, can change it
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Modified !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) { // only the user who created the sauce, can delete it
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Deleted !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) 
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
};

exports.createLike = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            let userId = req.auth.userId;
            let likeRequest = req.body.like;

            if (likeRequest === 1) { // like
                Sauce.updateOne({ _id: req.params.id }, {$inc:{ likes: +1 }, $push:{ usersLiked: userId }})
                    .then(() => res.status(200).json({ message: 'Liked !' }))
                    .catch(error => res.status(401).json({ error }));
            }
            if (likeRequest === 0) { // cancellation
                if (sauce.usersLiked.includes(userId)) { // check if userId is in the usersLiked array
                    Sauce.updateOne({ _id: req.params.id }, {$inc:{ likes: -1 }, $pull:{ usersLiked: userId }})
                        .then(() => res.status(200).json({ message: 'Like cancelled !' }))
                        .catch(error => res.status(401).json({ error }));
                }
                if (sauce.usersDisliked.includes(userId)) { // check if userId is in the usersDisliked array
                    Sauce.updateOne({ _id: req.params.id }, {$inc:{ dislikes: -1 }, $pull:{ usersDisliked: userId }})
                        .then(() => res.status(200).json({ message: 'Dislike cancelled !' }))
                        .catch(error => res.status(401).json({ error }));
                }
            }
            if (likeRequest === -1) { // dislike
                Sauce.updateOne({ _id: req.params.id }, {$inc:{ dislikes: +1 }, $push:{ usersDisliked: userId }})
                    .then(() => res.status(200).json({ message: 'Disliked !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};
