var express = require('express');

const passport = require('passport');
var router = express.Router();
const userModel = require("./users");
const mailModel = require("./mails");
const localStrategy = require("passport-local");
passport.use(new localStrategy (userModel.authenticate()));
const multer = require("multer");
const app = require('../app');
function fileFilter (req, file, cb) {
  if(file.mimetype==="image/jpg" || file.mimetype==="image/png"|| file.mimetype==="image/jpeg" || file.mimetype==="image/webp"){
  cb(null,true);
}
  else {
    cb(new Error("error"))
  }

 }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
   const fn = Date.now()+ Math.floor(Math.random()*100000000) + file.originalname
    cb(null, fn);
  }
})

const upload = multer({ storage: storage,fileFilter:fileFilter })


router.get('/',redirectToProfile ,function(req, res, next) {
  res.render('index');
});
router.get('/check/:username',async function(req, res, next) {
  let user= await userModel.findOne({username:req.params.username})
 res.json({user})
});

router.get('/profile',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .populate({
    path:"receivedMails",
    populate:{
      path:"userid"
    }
  })
  .then(function(foundUser){
    res.render("profile",{foundUser})
  })
});

router.post("/register",function(req,res,next){

  const data = new userModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email,
    gender:req.body.gender,
    mobile:req.body.mobile
   })
   userModel
   .register(data,req.body.password)
   .then(function(registeredUser){
     passport.authenticate("local")(req,res,function(){
       res.redirect("/profile");
     })
   })
 })


 router.post('/fileuploads',isLoggedIn, upload.single('image'),async function(req, res, next) {
 let loggedinUser= await userModel.findOne({username:req.session.passport.user});
 loggedinUser.profilePic = req.file.filename;
 await loggedinUser.save();
 res.redirect(req.headers.referer);
});

 

router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/",
  }) ,function(req,res){})

  router.get("/login", function(req,res){
    res.render("login");
  })

router.get("/register",function(req,res){
    res.render("register");
  })
  
  
router.post("/compose",isLoggedIn, async function(req,res){
  const loggedinUser = await userModel.findOne({username:req.session.passport.user})
  const createdMail = await mailModel.create({
      userid:loggedinUser._id,
      receiver:req.body.receivermail,
      mailtext:req.body.mailtext
    })

  loggedinUser.sentMails.push(createdMail._id);
    const loggedinUserUpdated = await loggedinUser.save();

  const receiverUser = await userModel.findOne({email:req.body.receiveremail})
    receiverUser.receivedMails.push(createdMail._id)

  const updatedReceiverUser = await receiverUser.save();
    res.send(" sab hogaya lala!");
 })

router.get("/logout",function(req,res){
  req.logout(function(err){
    if(err) throw err;
    res.redirect("/");
  })
})

router.get("/sent",isLoggedIn, async function(req,res){
const loggedinUser =  await userModel
.findOne({username:req.session.passport.user})
.populate({
  path:'sentMails',
  populate:{
    path:'userid'
  }
})

res.render( "sent",{foundUser:loggedinUser});
})



function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();                          
  }
  res.redirect("/")
}

function redirectToProfile(req,res,next){
  if(req.isAuthenticated()){
   res.redirect("/profile")
  }
  return next()
}


module.exports = router;