var mongoose=require("mongoose");
var answers=require("./answers.js");

var qSchema=new mongoose.Schema({
    question:String,
    type:String,
    formid:String,
    pos:Number,
    answers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'answers'
    }],
    options:[{
        
        type:String
    }],
    noopt:{
        type:Number,
        default:0
    },
    img:[{
        url:String,
        
        name:String
    }],
    
});
module.exports=mongoose.model("questions",qSchema);