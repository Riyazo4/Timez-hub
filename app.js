const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require('./models/atlas')
const session = require('express-session');
const nocache = require('nocache');
const bodyParser = require('body-parser');
var MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config()

const app = express();


// var store = new MongoDBStore({
//   uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
//   collection: 'mySessions'
// });


// store.on('error', function(error) {
//   console.log(error);
// });

app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
 
  resave: true,
  saveUninitialized: true
}));

// DB connection
app.use(session({
  secret:'Key',
  resave:true,
  saveUninitialized:true,
  cookie:{maxAge:1000 * 60 * 60 * 24 * 7}
}))


const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/admin-assets")));
app.use(express.static(path.join(__dirname, "public/viewFull/assets")));
app.use(nocache());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

const start = function () {
  try {
  //  console.log(process.env.MONGO_URI);
    connectDB(process.env.MONGO_URI)
  }
  catch (err) {
    console.log(err);
  }
}
start()

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  
  res.render("error");
});

module.exports = app;
