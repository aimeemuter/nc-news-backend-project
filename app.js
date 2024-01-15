const express = require("express");
const app = express();
const {
  getApiInfo,
  getTopics,
} = require("./controllers/topics-controllers.js");

app.get("/api", getApiInfo);
app.get("/api/topics", getTopics);

module.exports = app;
