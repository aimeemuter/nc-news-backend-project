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
const { deleteComment } = require("./controllers/comments-controllers.js");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./error-handling.js");

app.use(express.json());

app.get("/api", getApiInfo);
app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("*", (request, response) => {
  response.status(404).send({
    message:
      "This endpoint does not exist... /api provides endpoint information",
  });
});
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);
module.exports = app;
