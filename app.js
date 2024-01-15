const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers.js");

app.get("/api/topics", getTopics);

module.exports = app;
