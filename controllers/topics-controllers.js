const { fetchTopics, insertTopic } = require("../models/topics-models.js");
const apiInfo = require("../endpoints.json");

exports.getApiInfo = async (request, response, next) => {
  response.status(200).send({ apiInfo });
};

exports.getTopics = async (request, response, next) => {
  const topics = await fetchTopics();
  response.status(200).send({ topics });
};

exports.postTopic = async (request, response, next) => {
  const topicToInsert = request.body;
  try {
    const topic = await insertTopic(topicToInsert);
    response.status(201).send({ topic });
  } catch (error) {
    next(error);
  }
};
