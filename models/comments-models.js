const db = require("../db/connection.js");

exports.removeComment = async (comment_id) => {
  await db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id]);
};

exports.updateComment = async (comment_id, patchData) => {
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
      rows: [comment],
    } = await db.query(
      `UPDATE comments 
      SET votes = votes + $1 
      WHERE comment_id = $2 RETURNING *`,
      [votesAdjustment, comment_id]
    );
    return comment;
  }
};
