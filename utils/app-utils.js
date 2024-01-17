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
  const result = await db.query(`SELECT * FROM topics WHERE slug = $1`, [slug]);
  return result.rows.length > 0;
};
