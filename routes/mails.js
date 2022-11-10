const mongoose= require("mongoose");
  
const mailSchema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    receiver: String,
    mailtext:String,

})

module.exports = mongoose.model("mail",mailSchema);