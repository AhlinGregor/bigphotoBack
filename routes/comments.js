const express = require("express")
const comments = express.Router();
const path = require('path');
const DB = require('../db/dbConn.js')

//Gets all the comments for a specified post in the DB
comments.get('/:id', async (req, res, next) => {
  try {
    var queryResult = await DB.commentsOn(req.params.id);
    console.log(queryResult)
    res.json(queryResult)
  }
  catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})

comments.post('/', async (req, res, next) => {
  if(!req.session.logged_in){
    console.log("req.session.logged_in: "+req.session.logged_in)
    res.json({status:{success: false, msg: "Can not add comment. You need to log-in!"}})
    res.end(200)
    return
  }

  let content = req.body.content;
  let postId = req.body.postId;
  try {
    let userId = req.session.uid;
    var queryResult = await DB.createComment(postId, userId, content);
    if (queryResult.affectedRows) {
      console.log("New comment added!")
      res.json({status:{success: true, msg: "New comment added!"}})
    }
  }
  catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})

comments.post('/reply', async (req, res, next) => {
  if(!req.session.logged_in){
    console.log("req.session.logged_in: "+req.session.logged_in)
    res.json({status:{success: false, msg: "Can not add reply. You need to log-in!"}})
    res.end(200)
    return
  }
  let { content, postId, commentId } = req.body;

  try {
    const userId = req.session.uid;

    // Fetch the parent comment to get the username
    const [parentComment] = await DB.getCommentWithUser(commentId);
    if (!parentComment) {
      return res.status(400).json({ status: { success: false, msg: "Parent comment not found." } });
    }

    const taggedContent = `@${parentComment.username} ${content}`;

    const queryResult = await DB.createCommentReply(postId, commentId, userId, taggedContent);

    if (queryResult.affectedRows) {
      console.log("Reply with mention added!");
      return res.json({ status: { success: true, msg: "Reply with mention added!" } });
    }

    res.status(500).json({ status: { success: false, msg: "Failed to add reply." } });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
})

module.exports = comments
