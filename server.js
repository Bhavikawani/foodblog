require("dotenv").config()  
const express = require('express')
const app = express()
const path = require("path")
const logger = require("morgan")
const mongoose = require("mongoose")
const session = require("express-session")

const User = require("./models/user")
const Blogs = require("./models/blogs")
const { Console } = require("console")

// app.listen(5000)
app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(session({
    secret:process.env.SECRET,
    resave: true,
    saveUninitialized: true,
}))

//EJS
app.set("view-engine", "ejs")

//DB Connection    
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).then(() => console.log("DB connected"))
  .catch(error => console.log(error)) 


  
//signup get
app.get("/", (req, res) => {
    res.render("signup.ejs")
    })

 //signup post
 app.post("/signup", async (req, res) => {
    try{
       const user = new User({
           name: req.body.name,
           email:  req.body.email,
           password:  req.body.password
       })
    await user.save();
    console.log("User Created")
    res.redirect("/login")
    } catch{
    res.redirect("/")
    }
})   

// login get
app.get("/login", (req, res) => {
    res.render("login.ejs")  
})

//login post 
app.post("/signin", async (req, res)=> {
    await User.find({ email: req.body.email }).then(data => {
       if(req.body.password == data[0].password){
           req.session.user = data[0]
           res.redirect("/index")
       }
    }) .catch(e =>{
        console.log(e)
        res.send("Error")
    })
})

//index
app.get("/index", async(req,res)=>{
    res.render("index.ejs")
})

app.post("/blogs",async (req, res) => {
             res.redirect("/blog")
        })
 
//blog
app.get("/blog",checkAuthentication, async(req,res)=>{
    await Blogs.find({ userId: req.session.user._id}).then(blogs=>{
        console.log(blogs)
       res.render("blog.ejs",{
          blogss : blogs,
          name: req.session.name
       })
    })
})

//addblog
app.post("/addblog", async (req,res)=>{
    try{
        const blogs =new Blogs({
        userId: req.session.user._id,
           content: req.body.content
        })
        await blogs.save()
        console.log("Blog Added")
        res.redirect("/blog")
    } catch{
        res.send("Error")
    }
})

// editblog
app.get("/editblog/:id", async(req, res)=>{
    await Blogs.findById(req.params.id).then(blogs =>{
        if(req.session.user._id == blogs.userId){
            res.render("editBlogs.ejs",{
                blogs : blogs
            })
        } else{
            res.redirect("/blog")
        } 
        
     }).catch(e =>{
        console.log(e)
        res.send("Error")
     })
})

//editblog post
app.post("/updateblog/:id", async(req, res)=>{
    await Blogs.findOneAndUpdate({_id: req.params.id},{
        $set: {
            content: req.body.content
        }
    }).then(result => {
        if(result){
            console.log("Blog Updated")
            res.redirect("/blog")
        }else{
            res.send("Error")
        }
    }).catch(e=>{
        res.send("Error in Catch")
    })
})

//delete blog
app.post("/deleteblog/:id",async(req, res)=>{
    await Blogs.findOneAndDelete({_id: req.params.id}).then(result=>{
        if(result){
            console.log("Blogs Deleted")
            res.redirect("/blog")
        }else {
            res.send("Error")
        }
    }).catch(e=>{
        console.log(e)
        res.send("Error in Catch")
    })
})

//logout
app.post("/logout", (req, res)=>{
    req.session.destroy()
    res.redirect("/")
})

//middleware
function checkAuthentication(req, res, next){
    if(req.session.user){
        return next()
    }else {
        res.redirect("/")
    }
}

app.use(function(req,res){
    res.send("Page Not Found")
})

app.listen(5000, ()=> {
    console.log("Listening on port 5000")
})
