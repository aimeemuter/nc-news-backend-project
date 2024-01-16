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
  postComment,
  patchArticle,
} = require("./controllers/articles-controllers.js");

app.use(express.json());

app.get("/api", getApiInfo);
app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);

app.all("/*", (request, response) => {
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
  if (error.code === "23503") {
    if (error.constraint.includes("article_id_fkey")) {
      response
        .status(404)
        .send({ message: "No article matching the provided ID" });
    }
    if (error.constraint.includes("author_fkey")) {
      response.status(404).send({ message: "Username does not exist" });
    }
  }
  if (error.code === "23502") {
    response.status(400).send({ message: "Insufficient data provided" });
  }
  next(error);
});
app.use((error, request, response, next) => {
  response.status(500).send({ message: "Internal server error" });
});
module.exports = app;
