const { fetchTopics } = require("../models/topics-models.js");
const apiInfo = require("../endpoints.json");

exports.getApiInfo = async (request, response, next) => {
  response.status(200).send({ apiInfo });
};

exports.getTopics = async (request, response, next) => {
  const topics = await fetchTopics();
  response.status(200).send({ topics });
};
