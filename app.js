var express = require("express"),
app = express(),
expressSession = require("express-session"),
mongoose = require("mongoose");
bodyParser = require("body-parser"),
User = require('./models/user'),
LocalStrategy = require("passport-local"),
passport = require("passport");


app.use(expressSession({
	secret : "YoLo",
	resave:false,
	saveUninitialized:false
}));


//==========================
//Connect Mongo and USES
//==========================

mongoose.connect('mongodb+srv://hello:v0sbEFcFwOjHoqpF@shops-trg7f.mongodb.net/shops?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("MongoDB connected");
});

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password'
//   },
//   function(username, password, done) {

//   }
// ));

//=============================
//ROUTES
//=============================

app.get("/",function(req,res){
	res.locals.page="index";
	res.render("index",{user:req.user});

});

app.get("/bussiness/new",isLoggedIn,function(req,res){
	res.locals.page = "newBussiness";
	res.render("newBussiness",{user:req.user});
});

app.get("/login",function(req,res,next){
	res.locals.page = "loginPage";
	if(req.isAuthenticated()){
		return res.redirect("/");
	}
	else{
		return next();
	};
	},function(req,res){
	res.render("loginPage",{user:req.user,info:req.query.info});
});

app.post("/register",function(req,res){

	User.register(new User({username:req.body.username,email:req.body.email}),req.body.password,function(err,user){

		if(err)
		{
			return res.redirect("/login?info=err");
		}

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
	});
});

app.post("/login",passport.authenticate("local",{successRedirect: '/',
                                   failureRedirect: '/login'}),function(err,user){
	console.log(err);
});

app.get("/logout",function(req,res){
	req.logout();
    res.redirect('/');

});
app.listen(3000,function(){
	console.log("Server Started");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	return res.redirect("/login");
}