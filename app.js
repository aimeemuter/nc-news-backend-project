const express = require("express");
const app = express();
const {
  getApiInfo,
  getTopics,
} = require("./controllers/topics-controllers.js");
const { getArticleById } = require("./controllers/articles-controllers.js");

app.get("/api", getApiInfo);
app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use((error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  }
});

module.exports = app;
