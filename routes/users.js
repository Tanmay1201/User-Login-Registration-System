var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
    'title': 'register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login',{
    'title': 'login'
  });
});

router.post('/register', function(req, res, next){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

   /* console.log(req);

    if(req.file.profileimage){
      console.log('uploading picture..');
      var profileimageoriginalimage = req.file.profileimage.originalname;
      var profileimagename          = req.file.profileimage.name;
      var profileimagemime          = req.file.profileimage.mimetype;
      var profileimagepath          = req.file.profileimage.path;
      var prrofileimageext          = req.file.profileimage.extension;
      var profileimagesize          = req.file.profileimage.size;
    } else {
        var profileimagename = 'noimage.png';
    }*/

      req.checkBody('name','name field is required').notEmpty();
      req.checkBody('email','email is required').notEmpty();
      req.checkBody('email','email is not valid').isEmail();
      req.checkBody('username','username is required').notEmpty();
      req.checkBody('password','password is required').notEmpty();
      req.checkBody('password2','password does not match').equals(req.body.password); 

      var errors = req.validationErrors();
      if(errors){
        res.render('register',{
          errors: errors,
          name: name,
          email: email,
          username: username,
          password: password,
          password2: password2
        });
      } else{
        var newUser = new User({
          name: name,
          email: email,
          username: username,
          password: password
          //profileimage: profileimagename          
        });

      

        req.flash('success', 'You are registered and may log in');

        res.location('/');
        res.redirect('/');
      }
});
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if (err) throw err;
    if(!user){
          console.log('Unknown User');
          return done(null, false, {message: 'Unknown User'});
      }
    else
      User.comparePassword(password, user.password, function(err,isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          console.log('Invalid password');
          return done(null, false, {message: 'Invalid Password'});
        } 
      });
    });
  }
));
router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:'Invalid username or password'}), function(req, res){
  console.log('Authentication Successfuk');
  req.flash('success', 'You are logged in');
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You have looged out');
  res.redirect('/users/login');
});
module.exports = router;
