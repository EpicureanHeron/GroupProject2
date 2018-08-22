require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var session = require("express-session");

var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

//fake user
var users = [
  {
    id: "123xyz",
    email: "test@test.com",
    password: "password"
  }
];

// Login with local strategy
passport.use(new LocalStrategy(
  {usernameField: "email"},
  function(email, password, done){
    //inside the local strategy callback
    //here we make the call to the db
    //to find the user based on their email
    //pretend we have it
    var user = users[0]
    if(email === user.email && password === user.password) {
      return done(null, user);
    } else {
      console.log("incorrect login");
    }
  }
));


passport.serializeUser(function(user, done){
  console.log("User id is saved to the session file here")
  done(null, user.id);
})


// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");


// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
