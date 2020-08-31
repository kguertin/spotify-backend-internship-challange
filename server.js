const path = require('path');

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);

const User = require('./models/user');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = "mongodb+srv://kevin:node1234@cluster0.kmmuu.mongodb.net/shopify";

const store = new MongoDBSession({
    uri: MONGODB_URI,
    collection: 'sessions'
})


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  }));

app.use((req, res, next) => {
    res.locals.isAuthenticated =  req.session.isLoggedIn;
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
      return next()
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next()
        }
        req.user = user;
        next();
      })
      .catch(err => {
        console.log(err)
      });
  });

const userRoutes = require('./routes/user.js');
const authRoutes = require('./routes/auth.js');

app.use(userRoutes);
app.use(authRoutes);

mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
.then(() => {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
})
.catch(err => console.log(err));

//upload image

// encrypt passwords, validation, flash error
