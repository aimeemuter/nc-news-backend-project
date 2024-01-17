const db = require("../db/connection.js");

exports.fetchUsers = async () => {
  const result = await db.query(`SELECT * FROM users`);
  return result.rows;
};
