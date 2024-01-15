const db = require("../db/connection.js");

exports.fetchArticleById = async (article_id) => {
  const regex = /^[0-9]+$/;
  if (regex.test(article_id)) {
    const result = await db.query(
      `SELECT * FROM articles WHERE article_id = $1`,
      [article_id]
    );
    if (result.rows.length === 0) {
      return Promise.reject({
        status: 404,
        message: "No article matching the provided ID",
      });
    } else {
      return result.rows[0];
    }
  } else {
    return Promise.reject({
      status: 400,
      message: "The article ID must be a number",
    });
  }
};
