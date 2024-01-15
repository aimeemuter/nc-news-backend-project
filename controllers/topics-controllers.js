const { fetchTopics } = require("../models/topics-models.js");

exports.getTopics = async (request, response, next) => {
  const topics = await fetchTopics();
  response.status(200).send({ topics });
};
