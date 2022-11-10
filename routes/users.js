const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/gmailapp");

 const userSchema = mongoose.Schema({
    name:String,
    username:String,
    password:String,
    profilePic:{
    type:String,
    default:"deft.jpg"
    },
    email:{
        type:String,
        unique:true
    },
    gender:String,
    mobile:String,
    sentMails:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"mail"
    }],
    receivedMails:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"mail"
    }],

})

userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema)
