const multer = require('multer');
const path = require('path');
const express = require("express")
const objave = express.Router();
const DB = require('../db/dbConn.js')


//Gets all posts in the DB
objave.get('/', async (req, res, next) => {
    try {
        var queryResult = await DB.allObjave();
        console.log(queryResult)
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

objave.post('/like', async (req, res) => {
  const {postId, userId} = req.body;

  try {
    await DB.createLike(userId, postId);
    res.json({success: true});
  } catch(err) {
    console.log(err);
    res.status(500).json({success: false});
  }
})

objave.post('/unlike', async (req, res) => {
  const { postId, userId } = req.body;

  try {
    await DB.deleteLike(userId, postId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


objave.get('/isliked/:userId/:postId', async (req, res) => {
  const {userId, postId} = req.params;
  console.log(`did ${userId} like ${postId}`);

  try{
    const rows = await DB.isLiked(userId, postId);
    console.log(`isLiked response ${rows.length}`)
    res.json({liked: rows.length > 0});
  } catch(err) {
    console.log(err);
    res.status(500).json({success: false});
  }
})

objave.get('/likecount/:postId', async (req, res) => {
  const {postId} = req.params;
  console.log("Fetching like count for postId:", postId);

  try{
    const rows = await DB.countLikes(postId);
    console.log("Like count result:", rows);
    res.json({ count: rows[0].count })
  } catch(err) {
    console.log(err);
    console.error("DB error:", err);
    res.status(500).json({ count:0 })
  }
})

//Gets one new based on the id
objave.delete('/delete/:id', async (req, res, next) => {
  try {
    console.log('came into delete')
    var queryResult = await DB.deleteObjava(req.params.id)
    console.log(queryResult);
    if (queryResult.affectedRows) {
      res.json({status:{success: true, msg: "Objava izbrisana!"}})
    }else{
      res.json({status:{success: false, msg: "Could not delete!"}})
    }
      
  }
  catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder for posts
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // e.g. ".jpg"
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload_dest = multer({ storage: storage });
// let upload_dest = multer({ dest: 'uploads/' })

//Inserts one new item to the database
objave.post('/', upload_dest.single('file'), async (req, res, next) => {

  if(!req.session.logged_in){
    console.log("req.session.logged_in: "+req.session.logged_in)
    res.json({status:{success: false, msg: "Can not add post. You need to log-in!"}})
    res.end(200)
    return
  }

  let description = req.body.description
  // let user = req.body.user
  let file = req.file

  var isAcompleteNovica = description && file;
  try{

    if (isAcompleteNovica && req.session.logged_in) {
      try {
        let user = req.session.uid;
        const file = req.file;
        console.log(file.filename);
          
        if (!file) {
          res.json({ status: { success: false, msg: "Could not upload" }});
        }else{
          console.log("File upladed");
          var queryResult = await DB.createObjava(file.filename, description, user)
          if (queryResult.affectedRows) {
            console.log("New post added!")
            res.json({status:{success: true, msg: "New post added!"}})
          }
        }
      } 
      catch (err) {
        console.log(err)
        res.sendStatus(500)
      }
    }
    else {
      console.log("A field is empty!")
      res.json({status:{success: false, msg: "A field is empty!"}})
    }
  } catch (err) {
    console.log(err);
  }

  res.end()

})

//Inserts one new item to the database
// objave.post('/edit/', async (req, res, next) => {

//     let title = req.body.title
//     let slug = req.body.slug
//     let text = req.body.text
//     let id = req.body.id
    

//     var isAcompleteNovica = title && slug && text && id 
//     if (isAcompleteNovica) {
//         try {
//             var queryResult = await DB.updateNovica(title, slug, text,id)
//             if (queryResult.affectedRows) {
//                 res.json({status:{success: true, msg: "News updated!"}})
//             }else{
//                 res.json({status:{success: false, msg: "News can not be updated!"}})
//             }
//         }  
//         catch (err) {
//             console.log(err)
//             res.sendStatus(500)
//         }
//     }
//     else {
//         console.log("A field is empty!")
//         res.json({status:{success: false, msg: "A field is empty!"}})
//         }
//     res.end()


// })

module.exports = objave
