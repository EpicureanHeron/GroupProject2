var db = require("../models");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var session = require("express-session");
var bcrypt = require("bcrypt");
var expressValidator = require("express-validator");
var mysql = require("mysql")
var saltRounds = 10;
var Sequelize = require("sequelize");

let sequelize = new Sequelize("ownflix", "root", "root", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

module.exports = function(app) {
  // Get all examples
  app.get("/api/examples", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.json(dbExamples);
    });
  });
  // Create a new example
  //began working on a POST for a user
  // app.post("/api/user", function(req, res) {
  //   db.User.create({
  //     firstName: req.body.firstName,
  //     lastName: req.body.lastName,
  //     email: req.body.email,
  //     password: req.body.password,
  //     address: req.body.address,
  //     city: req.body.city,
  //     state: req.body.state,
  //     zip: req.body.zip
  //   }).then(function(dbExample) {
  //     res.json(dbExample);
  //   });
  // });

  app.get("/register", function(req, res){
    console.log("you are on register")

  });

  app.post("/register", function(req, res) {
    req.checkBody("email", "Please use a valid email.").isEmail();
    req.checkBody("password", "Please use a valid email").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
      // res.render("index", {title: "Registration error"})
      console.log("error registering")
    } else {

    var email = req.body.email;
    var password = req.body.password;
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
    db.User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hash,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip
    }).then(function(){
      db.User.findAll({
        limit: 1,
        where: {
          email: email
        },
        order: [["createdAt", "DESC"]]
      }).then(function(userIDquery){
        var userID = userIDquery[0]
        console.log("USER ID: " + JSON.stringify(userID));
        req.login(JSON.stringify(userID), function(error){
          res.redirect("/Dashboard")
        })
      })
    })
  });
  }
  });

// SERIALIZATION
  //serialize the user
  passport.serializeUser(function(userID, done){
    console.log("Serialized: User id is saved to the session file here")
    done(null, userID);
  })

  //deserialize the user
  passport.deserializeUser(function(userID, done){
    console.log("Deserialized: User id is saved to the session file here")
    done(null, userID);
  })


  app.post("/api/movies", function(req, res) {
   console.log(req.user)
   userParsed =  JSON.parse(req.user)
  console.log("hopefully parsed the user JSON here: " + userParsed.id)
    //let userParsed = JSON.parse(req.user);
   // console.log(req.body);
    //title, loanStatus, loanerID, plot, poster, actors, omdbKey, director
    db.Movie.create({
      title: req.body.title,
      loanStatus: false,
      omdbKey: req.body.omdbKey,
      plot: req.body.plot,
      poster: req.body.poster,
      actors: req.body.actors,
      director: req.body.director,
      UserId: userParsed.id
    }).then(function(dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function() {
      res.json(dbExample);
    });
  });
};