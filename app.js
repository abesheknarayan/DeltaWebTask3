var express=require("express");
var app=express();


var port=3000;
var localStrategy=require("passport-local");
var passport=require("passport");
var file="";
var file2="";
var passportlocalmongoose=require("passport-local-mongoose");
var mongoose=require("mongoose");
var user=require("./models/users");
var form=require("./models/forms");
var question=require("./models/questions");
var answer=require("./models/answers");
var path=require("path");
var multer=require("multer");
var flash=require("connect-flash");
var webpush=require("web-push");

var publicVapidkey="BMx0gy_PwfNmEg50ZFOTW0YMKzFrobijNjDEmZNbPfchD44YxGrbbHUtX8LZTSthADGQOvm51vB45-5gcm-gbvw";
var privateVapidkey="cewKa9T90PeSsDtagjcsa3n2aTE3CynCcOwuOJKDuEc";
webpush.setVapidDetails("mailto:test@test.com",publicVapidkey,privateVapidkey);

const storage=multer.diskStorage({
  destination:"./public/uploads/",
  filename: function(req,file,cb){
      cb(null,file.fieldname +"-" + Date.now() +path.extname(file.originalname))
  }  
});
const upload=multer({
    storage:storage
});


mongoose.connect("mongodb://localhost:27017/form",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
    
    
});
app.use(express.static(__dirname + '/public'));
var bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(require("express-session")({
secret:"CR7 is the best",
resave:false,
saveUninitialized:false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/",function(req,res)
{
    res.render("home");
});

app.get("/register",function(req,res)
{   
    user.find({},function(err,userlist){
        if(err)
        {
            console.log(err);
        }
        else{

            res.render("register",{
                regerror:req.flash("loginerror"),
                users:userlist
            });
        }
        
    })

});
app.post("/form/:fid/upload/file",upload.single("myfile"),function(req,res)
{
  
        console.log(req.file);
        file="/uploads/"+req.file.filename;
        var file2="/uploads/"+req.file.filename;
          form.findById(req.params.fid,function(err,form1)
          {
             if(err)
             {
                console.log(err)
             }
             else{
                var name=  file2.split(".");
                var name2=name[0].split("/");

              var obj={
                  url:file,
                 
                  fname:name2[2],
                  ftype:name[1]
              }
              form1.file.push(obj);
              form1.save(function(err,sf)
              {
                  if(err)
                  {
                      console.log(err);
                  }
                  else{
                      res.redirect("/form/edit/" +req.params.fid);
                  }
              })
             }
          })
      
    
})
app.post("/form/:fid/delete/file/:fname",function(req,res)
{
    form.findById(req.params.fid,function(err,form1){
        if(err)
        {
            console.log(err);
        }
        else{
            form1.file.forEach(function(file,index){
                if(file.fname==req.params.fname)
                {
                    form1.file.splice(index,1);
                }
            })
            form1.save(function(err,sdf)
            {
                if(err)
                {console.log(err);}
                else{
                    res.redirect("/form/edit/"+req.params.fid);
                }
            })
        }
    })
})

app.post("/form/:fid/upload/:qid",upload.single("myfile"),function(req,res)
{
   
            console.log(req.file);
          file="/uploads/"+req.file.filename;  
         var  file2="/uploads/"+req.file.filename;
          console.log(file2);
          console.log(file+"////////////////////////////");
           question.findById(req.params.qid,function(err,q1)
           {
               if(err)
               {
                   console.log(err);
               }
               else{
                     var name=  file2.split(".");
                     var name2=name[0].split("/");

                   var obj={
                       url:file,
                       
                       name:name2[2]
                   }
                   q1.img.push(obj);
                   q1.save(function(err,iq)
                   {
                       if(err)
                       {
                           console.log(err);
                       }
                       else{
                        res.redirect("/form/edit/"+req.params.fid);
                       }
                   })
               }
           })

        
         
        
            
        })

app.get("/login",function(req,res)
{
    res.render("login",
    {
       msg:req.flash("error") ,
       logout:req.flash("logout")
    });
   
    
})
app.get("/user",isloggedin,function(req,res)
{
    user.findById(req.user.id).populate("allforms").exec(function(err,user)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            
        
                     console.log(user);
                 res.render("user",{
                     user:user,
                     
                     msg:req.flash("welcome")
                 });
             }
         })


    })
app.post("/form/:fid/delete/img/:imgd/:qid",function(req,res)
{
    question.findById(req.params.qid,function(err,q1)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            q1.img.forEach(function(i,index){
                if(i.name==req.params.imgd)
                {
                    q1.img.splice(index,1);
                }
            })
            q1.save(function(err,dform)
            {
                if(err)
                {
                    console.log(err);
                }
                else{
                    res.redirect("/form/edit/"+req.params.fid);
                }
            })
        }
    })
})

app.get("/user/explore",isloggedin,function(req,res)
{
    user.findById(req.user.id,function(err,user)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            form.find({},function(err,allforms)
            {
                if(err)
                {
                    console.log(err);
                }
                else{
                    res.render("explore",{
                        user:user,
                        forms:allforms
                    })
                }
            })
            
        }
    })
})

app.get("/user/sort/:no",isloggedin,function(req,res)
 {  
    // console.log(req.user);
   user.findById(req.user.id,function(err,user)
   {
       if(err)
       {
           console.log(err);
       }
       else{
           var t=req.params.no;
        if(t=="2")
        form.find({}).sort({subm:-1}).exec(function(err,allforms)
        {
            if(err)
            {
                console.log(err);
            }
            else{
                // console.log(user);
                res.render("explore",{
                    user:user,
                    forms:allforms,
                    
                });
            }
        })
        else if(t=="1")
        {form.find({}).sort({time:-1}).exec(function(err,allforms)
        {
            if(err)
            {
                console.log(err);
            }
            else{
                // console.log(user);
                res.render("explore",{
                    user:user,
                    forms:allforms,
            
                });
            }
        })
        

        }
        
           
          
       }
   })
});


   


app.post("/register",function(req,res)
{ req.body.username
    req.body.password

    user.register(new user({
        username:req.body.username,
        

    }),req.body.password,function(err,user)
    {
        if(err)
        {
            console.log(err);
            var m=err.message
            req.flash("loginerror",m);
            res.redirect("/register");
           
        }
        else{

        

        
        passport.authenticate("local")(req,res,function()
        {
           req.flash("welcome"," Welcome "+user.username) 
           res.redirect("/user");          
           
        });
       
        }
    });
});
app.get("/create/form",isloggedin,function(req,res)
{
    form.create({
        title:"Untitled form",
      totalq:0,
      time:Date.now()
    },function(err,form)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            // console.log(form);
            user.findById(req.user.id,function(err,user)
            {
                if(err)
                {
                    console.log(err);
                }
                else{
                 user.allforms.push(form.id);  
                 user.save(function(err,saved)
                 {
                     if(err)
                     {
                        console.log(err);
                     }
                     else{
                        res.redirect("/form/edit/"+form.id); 
                     }
                     
                 })
                 
                }
            })
           
        }
    })
})
app.post("/form/:fid/question/type/:qid/:type",function(req,res)
{
  question.findByIdAndUpdate(req.params.qid,{
      type:req.params.type
  },function(err,q)
  {
    if(err)
    {
        console.log(err);
    }
    else{
        res.redirect("/form/edit/"+req.params.fid);
    }
  })

})
app.post("/form/delete/:fid",function(req,res)
{
    form.findByIdAndDelete(req.params.fid,function(err,form)
    {
            if(err)
            {
                console.log(err);
            }
            else{
                answer.findOneAndDelete({formid:req.params.id},function(err,ans)
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        res.redirect("/user");
                    }
                })
            }
    })
})
app.post("/form/edit/:id/add/:type",function(req,res,)
{  
    // console.log(req.params.id);
    question.create({
        type:req.params.type,
        question:req.body.text,
        formid:req.params.id

        
    },function(err,question)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            // console.log(question);
            form.findById(req.params.id,function(err,thisform)
            {
                
                var total=thisform.totalq;
                total++;
                thisform.totalq=total;
                thisform.questions.push(question);
                
                thisform.save(function(err,saved)
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        // console.log(saved);
                          question.pos=total;
                          question.save(function(err,savedq)
                          {
                              if(err)
                              {
                                  console.log(err);
                              }
                              else{
                                //   console.log(savedq);
                                  res.redirect("/form/edit/"+thisform.id);
                              }
                          })
                       
                    }
                })   
            })
        }
    })
}); 
async function fn1(req,res)
{
var dur=req.body.duration*86400000;
try{
    var form1=await form.findByIdAndUpdate(req.params.id,{
        title:req.body.title,
        description:req.body.description,
        duration:dur,
        days:req.body.duration,
        subperuser:req.body.subperuser
    })
}
catch(err)
{
    console.log(err);
}
try{
    var form2=await form.findById(req.params.id).populate("questions");

    for(var i=0;i<form2.questions.length;i++)
    {
        var index="q"+form2.questions[i].pos;
        var aindex="id"+form2.questions[i].pos;
        var qpos=form2.questions[i].pos;

        var q=await question.findOneAndUpdate({pos:qpos,formid:form2.id},{
            question:req.body[index]
        });
    }
    
res.redirect("/form/edit/"+req.params.id);
}
catch(err)
{
    console.log(err);
}
console.log("//////////egtgthg/////////////////////");
console.log(form2);

}



app.post("/form/:id/save",function(req,res){
fn1(req,res);
});


app.get("/form/edit/:id",isloggedin,function(req,res)
{
    
    form.findById(req.params.id).populate("questions").exec(function(err,editform)
    {  if(err)
        {
            console.log(err);
        }
        else{
            
            res.render("editform",{
                form:editform,
                file:file
            });
        }
       
    })
   

});
app.post("/form/:fid/question/delete/:qid",function(req,res)
{
    question.findByIdAndDelete(req.params.qid,function(err,dq)
    { 
        if(err)
        {
            console.log(err);
        }
        else{
            // console.log(dq);
            form.findById(req.params.fid,function(err,newform)
            {
                if(err)
                {
                    console.log(err);
                }
                else{
                   
                   
                    // newform.questions.pull({})
                    for(var i=0;i<newform.totalq;i++)
                    {
                       if(newform.questions[i]==dq.id)
                       {
                           newform.questions.splice(i,1);
                       }
                    }
                    for(var j=0;j<newform.analytics.length;j++)
                    {
                        if(newform.analytics[j].pos==dq.pos)
                        {
                            newform.analytics.splice(j,1);
                        }
                    }
                    var tq=newform.totalq;
                    

                   

                    newform.save(function(err,editedform)
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        // console.log(editedform);
                        res.redirect("/form/edit/"+req.params.fid);
                    }
                })
                }
            })
           

        }


    })
});

app.get("/create/custom/:type",function(req,res)
{
    var t=req.params.type;
    if(t=="1")
    {
         form.create({
           title:"Contact Information",
           time:Date.now(),
           totalq:5

         },function(err,form1){
            if(err)
            {
                console.log(err);
            }
            else{
                question.create({
                    question:"Name",
                    pos:1,
                    type:"text",
                    formid:form1.id,
                    
                    
                },function(err,q1)
                {
                    if(err)
                    {
                        console.log(err);
                    
                        
                    }
                    else{
                        form1.questions.push(q1);
                        question.create({
                            question:"Age",
                            type:"num",
                            pos:2,
                            formid:form1.id
                        },function(err,q2){
                            if(err)
                            {
                                console.log(err);
                            }
                            else{
                                form1.questions.push(q2);
                                question.create({
                                    question:"Email",
                                    type:"text",
                                    pos:3,
                                    formid:form1.id
                                },function(err,q3){
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else{
                                        form1.questions.push(q3);
                                        question.create({
                                          question:"Phone Number",
                                          type:"num",
                                          pos:4,
                                          formid:form1.id  
                                        },function(err,q4){
                                            if(err){
                                                console.log(err)
                                            }
                                            else{
                                                form1.questions.push(q4);
                                                question.create({
                                                    question:"Address",
                                                    type:"text",
                                                    pos:5,
                                                    formid:form1.id


                                                },function(err,q5){
                                                    if(err)
                                                    {
                                                        console.log(err);
                                                    }
                                                    else{
                                                       form1.questions.push(q5);
                                                       form1.save(function(err,fform)
                                                       {
                                                           if(err)
                                                           {
                                                               console.log(err);
                                                           }
                                                           else{
                                                               user.findById(req.user.id,function(err,user1){
                                                                   if(err)
                                                                   {
                                                                       console.log(err);
                                                                   }
                                                                   else{
                                                                       user1.allforms.push(form1);
                                                                       user1.save(function(err,u)
                                                                       {
                                                                           if(err)
                                                                           {
                                                                               console.log(err)

                                                                           }
                                                                           else{
                                                                            res.redirect("/form/edit/"+form1.id);
                                                                           }
                                                                       })
                                                                   }
                                                               })
                                                            
                                                           }
                                                       })

                                                    }
                                                })
                                            }

                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
         })
    }
    else if(t=="2")
    {
        form.create({
            title:"T-Shirt Registration",
            time:Date.now(),
            totalq:4
 
          },function(err,form1){
             if(err)
             {
                 console.log(err);
             }
             else{
                 question.create({
                     question:"Name",
                     pos:1,
                     type:"text",
                     formid:form1.id,
                     
                     
                 },function(err,q1)
                 {
                     if(err)
                     {
                         console.log(err);
                     
                         
                     }
                     else{
                         form1.questions.push(q1);
                         question.create({
                             question:"Size",
                             type:"radio",
                             pos:2,
                             formid:form1.id
                         },function(err,q2){
                             if(err)
                             {
                                 console.log(err);
                             }
                             else{
                                q2.options.push("xs");
                                q2.options.push("s");
                                q2.options.push("m");
                                q2.options.push("L");
                                q2.options.push("XL");
                                q2.save(function(err,q)
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else{

                                

                                 form1.questions.push(q2);
                                 question.create({
                                     question:"T-shirt Preview(Image)",
                                     type:"text",
                                     pos:3,
                                     formid:form1.id
                                 },function(err,q3){
                                     if(err)
                                     {
                                         console.log(err);
                                     }
                                     else{
                                         form1.questions.push(q3);
                                         question.create({
                                           question:"Other Sepcifications ",
                                           type:"text",
                                           pos:4,
                                           formid:form1.id  
                                         },function(err,q4){
                                             if(err){
                                                 console.log(err)
                                             }
                                             else{
                                                 form1.questions.push(q4);
                                                 form1.save(function(err,sf)
                                                 {
                                                     if(err)
                                                     {
                                                         console.log(err);
                                                     }
                                                     else{
                                                        user.findById(req.user.id,function(err,user1){
                                                            if(err)
                                                            {
                                                                console.log(err);
                                                            }
                                                            else{
                                                                user1.allforms.push(form1);
                                                                user1.save(function(err,u)
                                                                {
                                                                    if(err)
                                                                    {
                                                                        console.log(err)

                                                                    }
                                                                    else{
                                                                        res.redirect("/form/edit/"+form1.id);
                                                                    }
                                                                })
                                                            }
                                                        })
                                                     
                                                     }
                                            
                                                 })
                                             
                                           
                                                            }
                                                        })
 
                                                     }
                                                 })
                                             }
 
                                         })
                                     }
                                 })
                             }
                         })
                     }
                 })
             }

else if(t=="3")
{
    form.create({
        title:"Fest Registration",
        description:"Please fill down the following details",
        time:Date.now(),
        totalq:5

      },function(err,form1){
         if(err)
         {
             console.log(err);
         }
         else{
             question.create({
                 question:"Name",
                 pos:1,
                 type:"text",
                 formid:form1.id,
                 
                 
             },function(err,q1)
             {
                 if(err)
                 {
                     console.log(err);
                 
                     
                 }
                 else{
                     form1.questions.push(q1);
                     question.create({
                         question:"What Days You will Attend",
                         type:"check",
                         pos:2,
                         formid:form1.id
                     },function(err,q2){
                         if(err)
                         {
                             console.log(err);
                         }
                         else{
                            q2.options.push("Day 1");
                            q2.options.push("Day 2");
                            q2.options.push("Day 3");
                            q2.options.push("Day 4");
                            q2.options.push("Day 5");
                            q2.save(function(err,q)
                            {
                                if(err)
                                {
                                    console.log(err);
                                }
                                else{

                            

                             form1.questions.push(q2);
                             question.create({
                                 question:"Email",
                                 type:"text",
                                 pos:3,
                                 formid:form1.id
                             },function(err,q3){
                                 if(err)
                                 {
                                     console.log(err);
                                 }
                                 else{
                                     form1.questions.push(q3);
                                     question.create({
                                       question:"Organisation Name(School orCollege) ",
                                       type:"text",
                                       pos:4,
                                       formid:form1.id  
                                     },function(err,q4){
                                         if(err){
                                             console.log(err)
                                         }
                                         else{
                                             form1.questions.push(q4);
                                               question.create({
                                                   question:"Dietary Restictions",
                                                   type:"radio",
                                                   pos:5,
                                                   formid:form1.id
                                               },function(err,q5){
                                                   if(err)
                                                   {
                                                       console.log(err);
                                                   }
                                                   else{
                                                       q5.options.push("Vegetarian");
                                                       q5.options.push("Vegan");
                                                       q5.options.push("Gluten-Free");
                                                       q5.options.push("Kosher");
                                                       q5.options.push("None");
                                                       q5.save(function(err,sq5){
                                                           if(err)
                                                           {
                                                               console.log(err);
                                                           }
                                                           else{

                                                       
                                                       form1.questions.push(q5);
                                              



                                             form1.save(function(err,sf)
                                             {
                                                 if(err)
                                                 {
                                                     console.log(err);
                                                 }
                                                 else{

                                                    user.findById(req.user.id,function(err,user1){
                                                        if(err)
                                                        {
                                                            console.log(err);
                                                        }
                                                        else{
                                                            user1.allforms.push(form1);
                                                            user1.save(function(err,u)
                                                            {
                                                                if(err)
                                                                {
                                                                    console.log(err)

                                                                }
                                                                else{
                                                                    res.redirect("/form/edit/"+form1.id);
                                                                }
                                                            })
                                                        }
                                                    })
                                                 
                                                 }
                                        
                                             })
                                            }

                                        }) 
                                    }
                                })
                                                        }
                                                    })

                                                 }
                                             })
                                         }

                                     })
                                 }
                             })
                         }
                     })
                 }
             })
}




})








app.post("/form/:fid/question/option/delete/:qid/:oindex",function(req,res)
{
    question.findById(req.params.qid,function(err,q)
    {
        if(err)
        {
            console.log(err);
        }
        else{
               q.options.splice(req.params.oindex,1);
               q.save(function(err,newq)
               {
                   if(err)
                   {
                       console.log(err);
                   }
                   else{
                    res.redirect("/form/edit/"+req.params.fid);         
                   }
               })
              
            }

        
    })
})

app.post("/form/:fid/:type/addopt/:qid",function(req,res)
{
    question.findById(req.params.qid,function(err,q)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            var option=req.params.type;
            var pos=option+q.pos;

            // console.log(req.body[pos]);
            
            q.options.push(req.body[pos]);
            q.save(function(err,savedq)
            {
                if(err)
                {
                    console.log(err);
                }
                else{
                    // console.log(savedq);
                    res.redirect("/form/edit/"+req.params.fid);
                }
            })
        }
    })
})

app.get("/form/:fid/submit",isloggedin,function(req,res)
{
   
        form.findById(req.params.fid).populate("questions").exec(function(err,form)
        {
          if(err)
          {
              console.log(err);
          }  
          else{
       
              res.render("response",{
                        form:form,
                        
                    })       
             
                  }
              
          
          });
        
       
    
});
async function a(req,res)
{
    console.log(req.body);
    try{

        var form1=await form.findById(req.params.fid).populate("questions");
    }
    catch(err)
{
    console.log(err);
}

var timenow=new Date();
try{
    var answers=await answer.create({
        formid:form1.id,
        time:timenow
    })

}
catch(err)
{
    console.log(err);
}
// console.log("amamamamamamamamamamamamamamamamamama");
// console.log(form1);

try{
 var sub=form1.subm;
sub++;
form1.subm=sub;
var form2=await form1.save();
}
catch(err)
{
console.log(err);
}


try{
   for(var i=0;i<form1.questions.length;i++)
   {
       var aindex="a"+form1.questions[i].pos;
       var cindex="c"+form1.questions[i].pos;
       var optindex="opt"+form1.questions[i].pos;
       var qpos=form1.questions[i].pos;
     

      var fq= await question.findOne({formid:form2.id,pos:qpos});
  

      if(fq.type=="check")
      {
           var cp=fq.pos;
           console.log(typeof req.body[cindex])
           if(typeof req.body[cindex] =="object")
           {
           for(var j=0;j<req.body[cindex].length;j++)
           {
            // console.log("//////ergegrfgrfegfg//////////////rgrg0");
            //  console.log(req.body[cindex][j]);
             var cpos=fq.pos;
             var obj={
                 check:req.body[cindex][j],
                 cpos:cpos
             }
             answers.checkedlist.push(obj);

           }}
           else if(typeof req.body[cindex]=="string"){
                 var chpos=fq.pos;
                 var obj={
                     check:req.body[cindex],
                     cpos:chpos

                 }
                 answers.checkedlist.push(obj);
           }
      }
      else if(fq.type=="image")
      {
          console.log(req.files);
         
          console.log(req.files);
          console.log("image");
        
        
              var file1="/uploads/"+req.files[0].filename;  
              var  file2="/uploads/"+req.files[0].filename;
              var qpos=fq.pos;
              var name=  file2.split(".");
              var name2=name[0].split("/");
              var obj={
                  url:file1,
                  name:name2[2], 
                  pos:qpos
              
              

          }
          req.files.splice(0,1);
          answers.img.push(obj);

      }
      else if(fq.type=="file")
      {
        
        console.log(req.files);
        console.log("file");
      
      
            var file1="/uploads/"+req.files[0].filename;  
            var  file2="/uploads/"+req.files[0].filename;
            var qpos=fq.pos;
            var name=  file2.split(".");
            var name2=name[0].split("/");
            var obj={
                url:file1,
                name:name2[2], 
                pos:qpos
            
            

        }
        
        console.log(obj);
        req.files.splice(0,1);
       
        console.log(req.files);
        answers.file.push(obj);
   
      }
      else {
          var p=fq.pos;
          var obj={
              answer:req.body[aindex],
              pos:p
          }

        if(  form1.analytics.length>0){
            for(var h=0;h<form1.analytics.length;h++){
                var t1=0;
                if(form1.analytics[h].pos==fq.pos)
               {
                   if(form1.analytics[h].a==req.body[aindex])
                   {var b=form1.analytics[h].f;
                   b++;
                   form1.analytics[h].f=b;
                   t1=1;
                   var form2=await form1.save();
                   break;
                   }
                   
                      
                 

               }

            }
            if(t1==0)
            {
                var myobj={
                    pos:fq.pos,
                    a:req.body[aindex],
                    f:1
                }
                form1.analytics.push(myobj);
                var form2=await form1.save();
            }
        }
        else{
            var myobj={
                pos:fq.pos,
                a:req.body[aindex],
                f:1
            }
            form1.analytics.push(myobj);
            var form2=await form1.save();  
        }
          answers.answerlist.push(obj);
      }
     var saveda= await answers.save();

   }
}
catch(err)
{
    console.log(err);
}

try{
    var loguser=await user.findById(req.user.id);
    var t=0;
    for(var k=0;k<loguser.subforms.length;k++)
    {
        if(loguser.subforms[k].formid==form1.id)
        {
            var times=loguser.subforms[k].time;
            times++;
            loguser.subforms[k].time=times;
            t=1;

            var saveduser=await loguser.save();
            break;
        }

    }
    if(t==0)
    {
        var obj2={
            formid:form1.id,
            time:1
        }
        loguser.subforms.push(obj2);
        var saveduser2=await loguser.save();
    }


}
catch(err)
{
    console.log(err);
}
try{
    res.redirect("/user");  
}
catch(err)
{

}






}





app.post("/form/:fid/submit/response",upload.any(),function(req,res){

    a(req,res);
    
});

app.get("/form/:fid/view/response",isloggedin,function(req,res)
{
form.findById(req.params.fid).populate("questions").exec(function(err,form1)
{
  if(err)
  {
      console.log(err);
  }
  else{
      answer.find({
          formid:req.params.fid
      },function(err,formresponses)
      {
          if(err)
          {
              console.log(err);
          }
          else{

            res.render("showresponse",{
                form:form1,
                answers:formresponses
            })
          }
      })
     
  }
      
  });
})
app.get("/form/:fid/get/chart",function(req,res)
{
    form.findById(req.params.fid).populate("questions").exec(function(err,form1)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            answer.find({formid:form1.id},function(err,answers)
            {
                if(err)
                {
                    console.log(err);
                }
                else{
                    res.render("analytics",{
                        answers:answers,
                        form:form1
                    })
                };
            })
        }
    })
})
app.get("/:fid/view/response/:aid",isloggedin,function(req,res)
{

          form.findById(req.params.fid).populate("questions").exec(function(err,form)
          {
              if(err)
              {
                  console.log(err);
              }
              else{
                //   console.log(form);
                  answer.findById(req.params.aid,function(err,answers)
                  {
                      if(err)
                      {
                          console.log(err);

                      }
                      else{
                        //   console.log(answers);
                        //   console.log("hello");
                          res.render("viewresponse",{
                              form:form,
                              answer:answers,
                            
                          });
                      }
                  })
                
              }
          })
        })



app.post("/login",passport.authenticate("local",
{   
    
    successRedirect:"/user",

    failureRedirect:"/login",
}),function(req,res)
{
if(err)
{

  console.log(err);


}
else
{

}
});

function isloggedin(req,res,next)
{
    if(req.isAuthenticated())

    {
        return next();
    }
    else{
    req.flash("error","Please login!!");
    res.redirect("/login");
}
}
app.get("/logout",function(req,res)
{
    req.logout();
     req.flash("logout","Successfully logged you out!");
    res.redirect("/login");
});




app.listen(port,function()
{
    console.log("form server running..");
});
