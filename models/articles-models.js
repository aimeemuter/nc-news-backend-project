const db = require("../db/connection.js");

exports.fetchArticles = async () => {
  const result = await db.query(
    `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, CAST(COUNT(comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC`
  );
  return result.rows;
};

exports.fetchArticleById = async (article_id) => {
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
};

exports.fetchCommentsByArticleId = async (article_id) => {
  const result = await db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
    [article_id]
  );
  return result.rows;
};

exports.insertComment = async (article_id, commentToInsert) => {
  const result = await db.query(
    `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
    [article_id, commentToInsert.username, commentToInsert.body]
  );
  return result.rows[0];
};
