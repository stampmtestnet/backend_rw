var http = require("http"),
  path = require("path"),
  methods = require("methods"),
  express = require("express"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  cors = require("cors"),
  passport = require("passport"),
  errorhandler = require("errorhandler"),
  mongoose = require("mongoose");

var dotenv = require("dotenv");
dotenv.config();

var isProduction = process.env.NODE_ENV === "production";

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require("method-override")());
app.use(express.static(__dirname + "/public"));

//conduit -> nftmarket
app.use(
  session({
    secret: "nftmarket",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

if (!isProduction) {
  app.use(errorhandler());
}

require("./models/User");
require("./models/Article");
require("./models/Comment");
require("./config/passport");

app.use(require("./routes"));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handlers
// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URL;

// finally, let's start our server...
if (isProduction) {
  mongoose
    .set("strictQuery", false)
    .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to DB");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.log("err", err);
    });
}

// if (isProduction) {
//   mongoose.connect(process.env.MONGODB_URI);
// } else {
//   mongoose.connect("mongodb://localhost/conduit");
//   mongoose.set("debug", true);
// }
