const { fetchArticleById } = require("../models/articles-models.js");

exports.getArticleById = async (request, response, next) => {
  const { article_id } = request.params;
  try {
    const article = await fetchArticleById(article_id);
    response.status(200).send({ article });
  } catch (error) {
    next(error);
  }
};
