const db = require("../db/connection.js");

exports.fetchCommentByCommentId = async (comment_id) => {
  const result = await db.query(
    `SELECT * FROM comments WHERE comment_id = $1`,
    [comment_id]
  );
  if (result.rows.length === 0) {
    return Promise.reject({
      status: 404,
      message: "No comment matching the provided ID",
    });
  } else {
    return result.rows;
  }
};

exports.doesTopicExist = async (slug) => {
  if (slug === undefined) return false;
  const result = await db.query(`SELECT * FROM topics WHERE slug = $1`, [slug]);
  if (result.rows.length === 0) {
    return Promise.reject({
      status: 404,
      message: "No topic matching the topic query",
    });
  } else {
    return true;
  }
};

exports.doesAuthorExist = async (username) => {
  if (username === undefined) return false;
  const result = await db.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);
  if (result.rows.length === 0) {
    return Promise.reject({
      status: 404,
      message: "No author matching the author query",
    });
  } else {
    return true;
  }
};
