const { removeComment } = require("../models/comments-models");
const { fetchCommentByCommentId } = require("../utils/find-by-id");

exports.deleteComment = async (request, response, next) => {
  const { comment_id } = request.params;
  try {
    await fetchCommentByCommentId(comment_id);
    await removeComment(comment_id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
