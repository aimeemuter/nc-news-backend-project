const db = require("../db/connection.js");
const { doesTopicExist, doesAuthorExist } = require("../utils/app-utils.js");
const format = require("pg-format");

exports.fetchArticles = async (queries) => {
  let { topic, author, sort_by = "created_at", order = "DESC" } = queries;

  if (topic) topic = topic.toLowerCase();
  if (author) author = author.toLowerCase();
  if (order) order = order.toUpperCase();
  if (sort_by) sort_by = sort_by.toLowerCase();

  const orderOptions = ["ASC", "DESC"];
  const isOrderValid = orderOptions.includes(order);
  const sortByOptions = ["title", "created_at", "votes", "comment_count"];
  const isSortByValid = sortByOptions.includes(sort_by);

  if (!isOrderValid || !isSortByValid) {
    return Promise.reject({
      status: 400,
      message: "Not a valid sort_by or order query",
    });
  } else {
    const sqlQueryArray = [
      `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url, CAST(COUNT(comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id`,
      `GROUP BY articles.article_id`,
    ];

    if (sort_by === "comment_count") {
      sqlQueryArray.push(`ORDER BY ${sort_by} ${order}`);
    } else {
      sqlQueryArray.push(`ORDER BY articles.${sort_by} ${order}`);
    }

    if (topic || author) {
      const [isTopic, isAuthor] = await Promise.all([
        doesTopicExist(topic),
        doesAuthorExist(author),
      ]);
      if (isTopic && !isAuthor) {
        sqlQueryArray.splice(1, 0, `WHERE topic = '${topic}'`);
      } else if (isAuthor && !isTopic) {
        sqlQueryArray.splice(1, 0, `WHERE articles.author = '${author}'`);
      } else if (isTopic && isAuthor) {
        sqlQueryArray.splice(
          1,
          0,
          `WHERE topic = '${topic}' AND articles.author = '${author}'`
        );
      }
    }
    const sqlQuery = sqlQueryArray.join(` `);
    const { rows: articles } = await db.query(sqlQuery);
    return articles;
  }
};

exports.fetchArticleById = async (article_id) => {
  const {
    rows: [article],
  } = await db.query(
    `SELECT articles.*, CAST(COUNT(comment_id) AS INT) AS comment_count 
    FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id  
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`,
    [article_id]
  );
  if (article) {
    return article;
  } else {
    return Promise.reject({
      status: 404,
      message: "No article matching the provided ID",
    });
  }
};

exports.fetchCommentsByArticleId = async (article_id) => {
  const { rows: comments } = await db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
    [article_id]
  );
  return comments;
};

exports.insertComment = async (article_id, commentToInsert) => {
  const {
    rows: [comment],
  } = await db.query(
    `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
    [article_id, commentToInsert.username, commentToInsert.body]
  );
  return comment;
};

exports.updateArticle = async (article_id, patchData) => {
  if (
    typeof patchData.inc_votes !== "number" &&
    patchData.inc_votes !== undefined
  ) {
    return Promise.reject({
      status: 400,
      message: "The value for inc_votes must be a number",
    });
  } else {
    const votesAdjustment = patchData.inc_votes || 0;
    const {
      rows: [article],
    } = await db.query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [votesAdjustment, article_id]
    );
    return article;
  }
};

exports.insertArticle = async (articleToInsert) => {
  const {
    title,
    topic,
    author,
    body,
    article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
  } = articleToInsert;
  const insertArticleQueryString = format(
    `INSERT INTO articles (title, topic, author, body, article_img_url) 
    VALUES (%L) RETURNING *`,
    [title, topic, author, body, article_img_url]
  );
  const {
    rows: [article],
  } = await db.query(insertArticleQueryString);
  return { ...article, comment_count: 0 };
};

exports.removeArticle = async (article_id) => {
  await db.query(`DELETE FROM articles WHERE article_id = $1`, [article_id]);
};
