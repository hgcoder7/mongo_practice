const express=require('express');
const app=express();

const path=require('path');
const userModel=require('./models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const { log } = require('console');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')))


app.get('/',function(req,res){
    res.render("index");
})
app.get('/read',async function(req,res){
    let allusers= await userModel.find();
    res.render("read", {users: allusers})
})
app.get('/edit/:userid',async function(req,res){
    let users= await userModel.findOne({_id:req.params.userid});
    res.render("edit", {users: users})
})
app.post('/update/:userid',async function(req,res){
    let {name,email,image}=req.body;
    let users= await userModel.findOneAndUpdate({_id:req.params.userid},{image,name,email},{new:true});
    res.redirect("/read")
})
app.get('/delete/:id',async function(req,res){
    let allusers= await userModel.findOneAndDelete({_id:req.params.id});
    res.redirect("/read")
})
app.post('/create', async function(req,res){
    let {name,email, password,image}=req.body;

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async (err, hash)=>{
            let createduser=await userModel.create({
                name,
                email,
                password:hash,
                image
            })
            let token =jwt.sign({email},"shhhhhh");
            res.cookie("token",token);
            res.redirect('./read');
        })
    })
})
app.get('/login',(req,res)=>{
    res.render("login");
})
app.post('/login',async(req,res)=>{
    let user= await userModel.findOne({email: req.body.email})
    if(!user) return res.send("something went wrong");

    bcrypt.compare(req.body.password,user.password, function(err,result){
        if(result) {
            let token =jwt.sign({email:user.email},"shhhhhh");
            res.cookie("token",token);
            res.send("yes you can login");
        }else{
            res.send("no you can't login");
        }
        

       
        
    })
})

app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})
// app.get('/create',async (req,res) =>{
//     const createduser = await userModel.create({
//         name:"harsh",
//         username:"harsh hsasjl",
//         email:"harsh@gamil.com"
//     })
//     res.send(createduser);
// })
// app.get('/update',async (req,res) =>{
//     const updateduser = await userModel.findOneAndUpdate({
//         name:"harsh"},
//     { name:"harshitsa"},
//     {new:true})
//     res.send(updateduser);
//})
app.listen('3000')