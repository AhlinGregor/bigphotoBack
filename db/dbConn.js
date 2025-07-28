const mysql = require('mysql2');


const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'SISIII2025_89231290',
})

conn.connect((err) => {
  if (err) {
    console.log("ERROR: " + err.message);
    return;
  }
  console.log('Connection established');
})


let dataPool = {}

dataPool.allObjave = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT Post.id, Post.photo, Post.description, Post.user_id, User.username, User.pfp FROM Post JOIN User ON Post.user_id = User.id ORDER BY Post.id DESC`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.allUsers = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT username FROM User`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.oneUser = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM User WHERE username = ?`, [username], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.deleteObjava = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`DELETE FROM Post WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.createObjava = (photo, desc, user) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Post (photo,description,user_id) VALUES (?,?,?)`, [photo, desc, user], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`DELETE FROM User WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.createUser = (uname, pass, pfp, bio) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO User (username,password,pfp,bio,role_id) VALUES (?,?,?,?,?)`, [uname, pass, pfp, bio, 3], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.commentsOn = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT Comment.id, Comment.content, Comment.comment_id, Comment.user_id, User.username, User.pfp FROM Comment JOIN User ON Comment.user_id = User.id WHERE post_id = ? ORDER BY Comment.id ASC`, id, (err, res) => {
      if (err) {return reject(err)}
      return resolve(res)
    })
  })
}

dataPool.getCommentWithUser = (commentId) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT Comment.id, Comment.content, Comment.comment_id, Comment.user_id, User.username FROM Comment JOIN User ON Comment.user_id = User.id WHERE Comment.id = ?`,
      [commentId],
      (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      }
    )
  })
}

dataPool.createComment = (post_id, user_id, content) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Comment (post_id,user_id,content) VALUES (?,?,?)`, [post_id, user_id, content], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.createCommentReply = (post_id, comment_id, user_id, content) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Comment (post_id,comment_id,user_id,content) VALUES (?,?,?,?)`, [post_id, comment_id, user_id, content], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.deleteComment = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`DELETE FROM Comment WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.createLike = (user_id, post_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Post_user_like (user_id,post_id) VALUES (?,?)`, [user_id, post_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.isLiked = (user_id, post_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Post_user_like WHERE user_id = ? AND post_id = ?`, [user_id, post_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.countLikes = (post_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT COUNT(*) as count FROM Post_user_like WHERE post_id = ?`, [post_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.deleteLike = (user_id, post_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`DELETE FROM Post_user_like WHERE user_id = ? AND post_id = ?`, [user_id, post_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.createCamera = (make, model) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Camera (make,model) VALUES (?,?)`, [make, model], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.AuthUser = (username) => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM User WHERE username = ?', username, (err, res, fields) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })

}



module.exports = dataPool;