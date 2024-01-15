const express = require("express");
const app = express();
const {
  getApiInfo,
  getTopics,
} = require("./controllers/topics-controllers.js");
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
} = require("./controllers/articles-controllers.js");

app.get("/api", getApiInfo);
app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.use("/*", (request, response) => {
  response.status(404).send({
    message:
      "This endpoint does not exist... /api provides endpoint information",
  });
});
app.use((error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  }
  next(error);
});
app.use((error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ message: "Invalid datatype for parameter" });
  }
  next(error);
});
app.use((error, request, response, next) => {
  response.status(500).send({ message: "Internal server error" });
});
module.exports = app;
