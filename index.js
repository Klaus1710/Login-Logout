const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const bodyparser = require('body-parser')
const cookieParser = require('cookie-parser')

const port = 4101

app.use(express.static(path.join(path.resolve(), "public")));

app.set("view engine", "ejs")

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(express.json());
app.use(cookieParser());

var url ="mongodb://localhost:27017/formDB";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
}

mongoose.connect(url, options,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to DB successfully");
  })
  .catch(err => {
    console.log("Error:", err.message);
});

const contact = mongoose.Schema({
    Name: String,
    Email: String
})
const isAuthenticated = (req, res, next) =>{
    const { token } = req.cookies;
    if(token){
      next();
    }
    else{
      res.render("login");
    }
};

const Contact = mongoose.model("contacts", contact);

// app.get("/", (req, res)=>{
//     res.render("index");
// })

app.get("/", isAuthenticated, async(req, res) => {
  // console.log(req.body);
  res.render("logout");
})

app.post("/login", async(req, res) => {
  // console.log(req.body);
  const {Name, Email} = req.body;
  const user = await Contact.create({Name, Email})
  res.cookie("token", user._id, { 
    httpOnly: true,
    expires: new Date(Date.now()+(60*1000))
  });
  res.redirect("/")
})

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now())
  });
  res.redirect("/")
})

// app.post("/", async(req, res)=>{
//     const e = await Contact.create(req.body)
//     const NAME = e.Name
//     res.render("confirm", {Name: `${NAME}`})
//     console.log(e.Name)
//     console.log(e.Email)
// })

app.listen(port, ()=>{
    console.log(`server is working on ${port}`)
})