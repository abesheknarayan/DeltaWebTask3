var mongoose=require("mongoose");
var answerSchema= new mongoose.Schema({
    answerlist:[{
       answer: String,
        pos:Number
    }],
    answertotal:Number,
    
    formid:String,
    checkedlist:[
        {
            check:String,
        
        cpos:Number
        }],
    responsetime:String,
    img:[{
       url:String,
       name:String,
       pos:Number
    }],
    file:[{
        url:String,
        name:String,
        pos:Number
    }],
    time:String

});
module.exports=mongoose.model("answers",answerSchema);