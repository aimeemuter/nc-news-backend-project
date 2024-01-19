const db = require("../db/connection.js");

exports.fetchTopics = async () => {
  const result = await db.query(`SELECT * FROM topics`);
  return result.rows;
};

exports.insertTopic = async (topicToInsert) => {
  const { slug, description } = topicToInsert;
  if (description) {
    const result = await db.query(
      `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`,
      [slug, description]
    );
    return result.rows[0];
  } else {
    const result = await db.query(
      `INSERT INTO topics (slug) VALUES ($1) RETURNING slug`,
      [slug]
    );
    return result.rows[0];
  }
};
