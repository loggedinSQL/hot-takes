const express = require('express');
const mongoose = require('mongoose');
const app = express();

const helmet = require('helmet');
const rateLimit = require('./middleware/rate-limit');
const dotenv = require('dotenv'); // use dotenv to prevent access control bypass

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

dotenv.config();

mongoose.connect('mongodb+srv://' + process.env.MONGO_LOG + ':' + process.env.MONGO_PASS + '@cluster-1.ag8xh6q.mongodb.net/?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB successfull connection !'))
.catch(() => console.log('MongoDB connexion has failed !'));

app.use(express.json());
helmet({
    crossOriginResourcePolicy: false,
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', rateLimit, userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
