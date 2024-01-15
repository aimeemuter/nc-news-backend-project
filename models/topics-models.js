const db = require("../db/connection.js");

exports.fetchTopics = async () => {
  const result = await db.query(`SELECT * FROM topics`);
  return result.rows;
};
