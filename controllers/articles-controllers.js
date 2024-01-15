const {
  fetchArticles,
  fetchArticleById,
  fetchCommentsByArticleId,
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
  const comments = await fetchCommentsByArticleId(article_id);
  response.status(200).send({ comments });
};
