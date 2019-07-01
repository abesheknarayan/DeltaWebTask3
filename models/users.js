var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
var form=require("./forms.js");
var questions=require("./questions.js");

var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    allforms:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'form'
            
        }
    ],
    subforms:[{
        formid:String,
        time:{
            type:Number,
         default:0}
    }]  
});
userSchema.plugin(passportlocalmongoose);
module.exports=mongoose.model("user",userSchema);