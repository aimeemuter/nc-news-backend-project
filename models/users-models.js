const db = require("../db/connection.js");

exports.fetchUsers = async () => {
  const result = await db.query(`SELECT * FROM users`);
  return result.rows;
};

exports.fetchUserByUsername = async (username) => {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
  if (user) {
    return user;
  } else {
    return Promise.reject({
      status: 404,
      message: "No user matching the username provided",
    });
  }
};
