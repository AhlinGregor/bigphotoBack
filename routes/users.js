const multer = require('multer');
const path = require('path');
const express = require("express")
const users = express.Router();
const DB = require('../db/dbConn.js')

//Checks if user submitted both fields, if user exist and if the combination of user and password matches
users.post('/login', async (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        try {
            let queryResult = await DB.AuthUser(username);

            if (queryResult.length > 0) {
                if (password === queryResult[0].password) {
                    console.log(queryResult)
                    console.log("LOGIN OK");
                    //req.session.user_email = queryResult[0].user_email;
                    req.session.logged_in = true;
                    // console.log(req.session.logged_in);
                    req.session.uid = queryResult[0].id;
                    // console.log(req.session.uid);
                    res.json({ success: true, message: "LOGIN OK", user: {id: queryResult[0].id, username: queryResult[0].username, role_id: queryResult[0].role_id }});
                    res.status(200)
                }
                else {
                    console.log("INCORRECT PASSWORD");
                    res.json({ success: false, message: "INCORRECT PASSWORD" });
                    res.status(200)
                }
            } else {
                console.log("USER NOT REGISTRED");
                res.json({ success: false, message: "USER NOT REGISTRED" });
                res.status(200)
            }
        }
        catch (err) {
            console.log(err)
            res.status(404)
        }
    }
    else {
        console.log("Please enter Username and Password!")
        res.json({ success: false, message: "Please enter Username and Password!" });
        res.status(204)
    }
    res.end();
});

users.get('/session', async (req, res, next)=>{
  try{
    console.log("session data: ")
    console.log(req.session)
    res.json(req.session);
  }
  catch(err){
    console.log(err)
    res.sendStatus(500)
    next()
  }
});
 
users.get('/logout', async (req,res, next)=>{
  try{
    req.session.destroy(function(err) {
      res.json({status:{success: true, msg: err}})
    })
      
  }
  catch(err){
    console.log(err)
    res.json({status:{success: false, msg: err}})
    res.sendStatus(500)
    next()
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'pfps/'); // folder for profile pics
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // e.g. ".jpg"
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload_dest = multer({ storage: storage });


users.post('/newUser', upload_dest.single('file'), async (req, res, next)=>{

  let username = req.body.username;
  let password = req.body.password;
  let file = req.file;
  let bio = req.body.bio;

  var isCompleteProfile = username && password && file && bio;

  try{
    var queryResult = await DB.oneUser(req.body.username);

    if(isCompleteProfile) {
      if(!queryResult.length) {
        const file = req.file;
        console.log(file.filename);

        if (!file) {
          res.json({ status: { success: false, msg: "Could not upload" }});
        }else{
          console.log("File upladed");
          var queryResult = await DB.createUser(username, password, file.filename, bio)
          if (queryResult.affectedRows) {
            console.log("New user added!!")
            res.json({status:{success: true, msg: "New user added!"},
            id: queryResult.insertId,
          })
          }
        }
      }else{
        console.log("Username already taken!");
        res.json({status:{success: false, msg: "Username already taken!"}})
      }
    }else{
			console.log("Please fill out all required fields!");
      res.json({status:{success: false, msg: "Please fill out all required fields!"}})
    }
  }
  catch(err){
    console.log(err)
    res.json({status:{success: false, msg: err}})
    res.sendStatus(500)
  }
  res.end()
})

users.post('/update', upload_dest.single('file'), async (req, res, next) => {
  if(!req.session.logged_in){
    console.log("req.session.logged_in: "+req.session.logged_in)
    res.json({status:{success: false, msg: "Can not add post. You need to log-in!"}})
    res.end(200)
    return
  }

  let username = req.body.username;
  let password = req.body.password;
  let file = req.file;
  let bio = req.body.bio;

  var isCompleteProfile = username && password && file && bio;
  try {
    var queryResult = await DB.updateUser(username, password, file.filename, bio);
  }
  catch (error) {
    console.error("error: ", error);
  }
})

users.post('/delete', async (req, res, next) => {
  if(!req.session.logged_in){
    console.log("req.session.logged_in: "+req.session.logged_in)
    res.json({status:{success: false, msg: "Can not delete user. You need to log-in!"}})
    res.end(200)
    return
  }
  let username = req.body.username;
  try {
    console.log('came into delete')
    var queryResult = await DB.deleteUser(username);
    console.log('after delete');
    if (queryResult.affectedRows) {
      res.json({status:{success: true, msg: "User izbrisan!"}})
    }else{
      res.json({status:{success: false, msg: "Could not delete!"}})
    }
      
  }
  catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})

users.get('/list', async (req, res, next) => {
  try {
    var queryResult = await DB.allUsers();
    res.json(queryResult)
  }
  catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})
 


// Inserts a new user in our database


module.exports = users
