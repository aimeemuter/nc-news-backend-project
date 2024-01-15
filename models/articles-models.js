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
