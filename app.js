const express  = require("express");
const app  =  express();
const path = require("path");
require('dotenv').config(()=>{
    console.log("ENV aaya");
});
const User  = require("./models/userSchema");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public/")));
app.use(express.urlencoded({extended:true}));
app.set(path.join(__dirname,"views"));
app.set("view engine","views");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const mongoose = require('mongoose');
main().then(()=>{
    console.log("Connected to database Succesfully!");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_CONNECT_URI);
}
// process.env.MONGODB_CONNECT_URI


const { v4: uuidv4 } = require('uuid');
const { title } = require("process");
uuidv4();

const PORT = process.env.PORT;
app.listen(PORT,(req,res)=>{
    console.log("Listenning on PORT:8080");
});


app.get("/home",(req,res)=>{
 
    res.render("home.ejs");
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

app.post("/signup",async(req,res)=>{
    let {name,username,password,mobilenumber}=req.body;
    let data = {name,username,password,mobilenumber};
    // console.log(data);
    let gotUser = await User.findOne({username:data.username});
    // console.log(gotUser);
    if(gotUser){
       res.redirect("/login");
    }else{
        await User.insertMany([data]);
        res.cookie("username",`${username}`);
        res.cookie("password",`${password}`);
         res.redirect("/user");
    }
// res.send("Working");
});

app.post("/login",async(req,res)=>{
    let {username,password}=req.body;
    let data = {username,password};
    // console.log(data);
    let gotUser = await User.findOne({username:data.username,password:data.password});
    // console.log(gotUser);
    if(gotUser ){
        res.cookie("username",`${username}`);
        res.cookie("password",`${password}`);
        res.redirect("/user");
    }else{
    //    res.send("User Not FOund Try again!");
    res.redirect("/login");
    }
// res.send("Working");
});


app.get("/user",async(req,res)=>{
    let data=req.cookies;
    // console.log( data.username);
    let saif = await User.find({username:data.username});
    // let userName = data.username;
    // console.log(saif);
    res.render("user.ejs",{saif});
    // res.render("user.ejs",{user});
});


app.post("/addtask",async(req,res)=>{
    let {id,title,content} = req.body;
    let user = await User.findById(id);
    let taskId = uuidv4();
    let arr = user.task;
    arr.push({taskId,title,content});
     await User.findByIdAndUpdate(id,{task:arr});
    res.redirect("/user");
});


app.post("/edit",async(req,res)=>{
    let {id,taskId,title,content} = req.body;
    //   console.log({id});   
    res.render("edit.ejs",{id,title,content,taskId} );
    // res.redirect("/user");
});

app.patch("/edited",async(req,res)=>{
    let {id,taskId,newtitle,newcontent}=req.body;
    // console.log( {id,taskId,newtitle,newcontent});
    let user = await User.findById(id);
    // console.log(user);
    for(i=0;i<user.task.length;i++){
        if(user.task[i].taskId==taskId){
            user.task[i].taskId=taskId;
            user.task[i].title=newtitle;
            user.task[i].content=newcontent;
            await User.findByIdAndUpdate(id,{"task":user.task},{new:true});
        }
    }
    // user.task.push({taskId,newtitle,newcontent});
    // await User.findByIdAndUpdate(id,{"task":{title:newtitle}},{new:true});
    res.redirect("/user");
});

app.delete("/delete",async(req,res)=>{
    let {id,taskId}=req.body;
    // console.log( {id,taskId});

    // let user = await User.findById(id);
    // // console.log(user);
    // for(i=0;i<user.task.length;i++){
    //     if(user.task[i].taskId==taskId){
    //         user.task[i].taskId=taskId;
    //         user.task[i].title=newtitle;
    //         user.task[i].content=newcontent;
    //         await User.findByIdAndUpdate(id,{"task":user.task},{new:true});
    //     }
    // }
    res.redirect("/user");
});

/*
Single Client

app.get("/home/edit/:id",async(req,res)=>{
    let {id}= req.params;
   let task = await Task.findById(id);
//    console.log(task);
    res.render("edit.ejs",{task});
});

app.put("/home/edited/:id",async(req,res)=>{
    let {id}=req.params;
    // console.log(id);
    let {newtitle,newcontent}=req.body;
    // console.log({newtitle,newcontent});
    await Task.findByIdAndUpdate(id,{title:newtitle,content:newcontent,time:Date().slice(0,24),new:true});
res.redirect("/home");
});

*/