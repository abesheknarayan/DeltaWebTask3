var mongoose=require("mongoose");
var questions=require("./questions.js");
var users=require("./users.js");
var formSchema=new mongoose.Schema({
    title:String,
    description:String,
    questions:[
        {
            

                type:mongoose.Schema.Types.ObjectId,
                ref:"questions"
    
            
            
        }
    ],
    totalq:{
        type:Number,
        default:0
    } ,
    submittedusers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }],
    
    time:Number,
    duration:{
        type:Number,
        default:86400000
    },
    days:{
        type:Number,
        default:1
    },
    subperuser:{
        type:Number,
        default:1
    },
    subm:{
        type:Number,
        default:0
    },
    file:[{
        url:String,
        fname:String,
        ftype:String
    }]
})
module.exports=mongoose.model("form",formSchema);