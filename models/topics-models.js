const db = require("../db/connection.js");

exports.fetchTopics = async () => {
  const { rows } = await db.query(`SELECT * FROM topics`);
  return rows;
};

exports.insertTopic = async (topicToInsert) => {
  const { slug, description } = topicToInsert;
  if (description) {
    const {
      rows: [topic],
    } = await db.query(
      `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`,
      [slug, description]
    );
    return topic;
  } else {
    const {
      rows: [topic],
    } = await db.query(`INSERT INTO topics (slug) VALUES ($1) RETURNING slug`, [
      slug,
    ]);
    return topic;
  }
};
