const express               =  require('express'),
      app                   =  express(),
      mongoose              =  require("mongoose"),
      passport              =  require("passport"),
      bodyParser            =  require("body-parser"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                  =  require("./models/user");
      var path = require('path')
      let alert = require('alert'); 
//Connecting database
mongoose.connect("mongodb://localhost/auth_demo");
app.use(require("express-session")({
    secret:"Any normal Word",       //decode or encode session
    resave: false,          
    saveUninitialized:false    
}));
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
//=======================
//      R O U T E S
//=======================
app.get("/", (req,res) =>{
    res.render("index");
})
//Auth Routes
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/order",(req,res)=>{
    res.render("order");
});
app.post("/login",async(req, res)=>{
    const existUsername = await User.findOne({ username: req.body.username});
    if (existUsername!=null) {
        if(existUsername['password']!=req.body.password)
        {
            alert("password entered is incorrect")
            res.render("login"); 
            return;  
        }
        res.redirect("/indexln");
    }
    else 
    {
        alert("You haven't registered yet")
        res.render("login"); 
        return;    
    }

});
app.get("/signup",(req,res)=>{
    res.render("signup");
});
app.get("/indexln",(req,res)=>{
    res.render("indexln");
});
app.post("/signup",async(req,res)=>{
    if(req.body.password!=req.body.confirmpassword)
    {
      alert("password and confirm password are different")
      res.render("signup"); 
      return;
    }
     let phone=req.body.phone;
     if(phone.length!=10 || isNaN(phone))
     {
        alert("phone number format not valid")
        res.render("signup"); 
        return;  
     }
     const existUsername = await User.findOne({ username: req.body.username});
     if (existUsername!=null) {
        alert("Userrname already exists")
        res.render("signup"); 
        return; 
     }
     const existemail = await User.findOne({ email: req.body.email});
     if (existemail!=null) {
        alert("Email already taken")
        res.render("signup"); 
        return; 
     }
    User.register(new User({fullname: req.body.fullname,username:req.body.username,email: req.body.email,phone: req.body.phone,password: req.body.password,confirmpassword: req.body.confimpassword}), req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("signup");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
//Listen On Server
app.listen(process.env.PORT ||3000,function (err) {
    if(err){
        console.log(err);
    }else {
        console.log("Server Started At Port 3000");
    }
      
});
