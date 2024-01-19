const { removeComment, updateComment } = require("../models/comments-models");
const { fetchCommentByCommentId } = require("../utils/app-utils");

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

exports.patchComment = async (request, response, next) => {
  const { comment_id } = request.params;
  const patchData = request.body;
  try {
    const promisesArray = await Promise.all([
      updateComment(comment_id, patchData),
      fetchCommentByCommentId(comment_id),
    ]);
    const comment = promisesArray[0];
    response.status(200).send({ comment });
  } catch (error) {
    next(error);
  }
};
