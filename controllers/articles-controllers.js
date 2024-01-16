const {
  fetchArticles,
  fetchArticleById,
  fetchCommentsByArticleId,
  insertComment,
  updateArticle,
} = require("../models/articles-models.js");

exports.getArticles = async (request, response, next) => {
  const articles = await fetchArticles();
  response.status(200).send({ articles });
};

exports.getArticleById = async (request, response, next) => {
  const { article_id } = request.params;
  try {
    const article = await fetchArticleById(article_id);
    response.status(200).send({ article });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsByArticleId = async (request, response, next) => {
  const { article_id } = request.params;
  try {
    const promisesArray = await Promise.all([
      fetchCommentsByArticleId(article_id),
      fetchArticleById(article_id),
    ]);
    const comments = promisesArray[0];
    response.status(200).send({ comments });
  } catch (error) {
    next(error);
  }
};

exports.postComment = async (request, response, next) => {
  const { article_id } = request.params;
  const commentToInsert = request.body;
  try {
    const comment = await insertComment(article_id, commentToInsert);
    response.status(201).send({ comment });
  } catch (error) {
    next(error);
  }
};

exports.patchArticle = async (request, response, next) => {
  const { article_id } = request.params;
  const patchData = request.body;
  try {
    const promisesArray = await Promise.all([
      updateArticle(article_id, patchData),
      fetchArticleById(article_id),
    ]);
    const article = promisesArray[0];
    response.status(200).send({ article });
  } catch (error) {
    next(error);
  }
};
