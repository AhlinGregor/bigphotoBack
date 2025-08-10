// import dependencies and initialize the express app
const express = require('express')
require('dotenv').config()
const app = express()
const cors = require("cors")
const path = require('path')
const port = process.env.PORT || 5009
const front = process.env.FRONT

// import local files
const objave = require('./routes/objave')
const users = require('./routes/users')
const comments = require('./routes/comments')


const session = require('express-session')

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}))

//Some configurations
app.use(express.urlencoded({extended : true}));
app.use(cors({
   //origin: 'http://127.0.0.1:3030',
   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
   credentials: true
}))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pfps', express.static(path.join(__dirname, 'pfps')));

// configurations
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   methods: ["GET", "POST"],
// }))

// actual routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"))
})

app.use('/objave', objave)
app.use('/users', users)
app.use('/comments', comments)
// app.use('/uploadFile', upload)


// start the express server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
