const {
  fetchArticles,
  fetchArticleById,
  fetchCommentsByArticleId,
  insertComment,
  updateArticle,
  insertArticle,
  removeArticle,
} = require("../models/articles-models.js");

exports.getArticles = async (request, response, next) => {
  const queries = request.query;
  try {
    const articles = await fetchArticles(queries);
    response.status(200).send({ articles });
  } catch (error) {
    next(error);
  }
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

exports.postArticle = async (request, response, next) => {
  const articleToInsert = request.body;
  try {
    const article = await insertArticle(articleToInsert);
    response.status(201).send({ article });
  } catch (error) {
    next(error);
  }
};

exports.deleteArticle = async (request, response, next) => {
  const { article_id } = request.params;
  try {
    await fetchArticleById(article_id);
    await removeArticle(article_id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
