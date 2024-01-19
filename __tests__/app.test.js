const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const endpointsData = require("../endpoints.json");
const { describe, test, expect } = require("@jest/globals");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("*", () => {
  test("404: responds to the client with an error message if endpoint not hit", async () => {
    const response = await request(app).get("/nonsense").expect(404);
    const { body } = response;
    const { message } = body;
    expect(message).toBe(
      "This endpoint does not exist... /api provides endpoint information"
    );
  });
});

describe("app.js", () => {
  describe("GET /api", () => {
    test("GET 200: responds to the client with an object describing all the available endpoints", async () => {
      const response = await request(app).get("/api").expect(200);
      const { body } = response;
      const { apiInfo } = body;
      expect(typeof apiInfo).toBe("object");
      expect(apiInfo).toEqual(endpointsData);
    });
  });
  describe("GET /api/topics", () => {
    test("GET 200: responds to the client with an array of topics", async () => {
      const response = await request(app).get("/api/topics").expect(200);
      const { body } = response;
      const { topics } = body;
      expect(topics.length).toBe(3);
      topics.forEach((topic) => {
        expect(typeof topic.description).toBe("string");
        expect(typeof topic.slug).toBe("string");
      });
    });
  });
  describe("GET /api/articles/:article_id", () => {
    test("GET 200: responds to the client with the article matching the id", async () => {
      const response = await request(app).get("/api/articles/1").expect(200);
      const { body } = response;
      const { article } = body;
      expect(article).toMatchObject({
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 100,
        comment_count: 11,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      });
    });
    test("GET 404: responds to the client with an error message when the article id is valid but not found", async () => {
      const response = await request(app).get("/api/articles/1000").expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No article matching the provided ID");
    });
    test("GET 400: responds to the client with an error message when the article id is invalid", async () => {
      const response = await request(app).get("/api/articles/abc").expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Invalid datatype for parameter");
    });
  });
  describe("GET /api/articles", () => {
    test("GET 200: responds to the client with an array of articles ordered by newest first", async () => {
      const response = await request(app).get("/api/articles").expect(200);
      const { body } = response;
      const { articles } = body;
      expect(articles.length).toBe(13);
      articles.forEach((article) => {
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
        expect(typeof article.comment_count).toBe("number");
      });
      expect(articles).toBeSorted({ key: "created_at", descending: true });
    });
    test("GET 200: responds to the client with an array of articles ordered by newest first that relate to the queried topic", async () => {
      const response = await request(app)
        .get("/api/articles?topic=mitch")
        .expect(200);
      const { body } = response;
      const { articles } = body;
      expect(articles.length).toBe(12);
      articles.forEach((article) => {
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(article.topic).toBe("mitch");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
        expect(typeof article.comment_count).toBe("number");
      });
      expect(articles).toBeSorted({ key: "created_at", descending: true });
    });
    test("GET 200: responds to the client with an empty array when there are no articles matching an existing topic or author", async () => {
      const topicResponse = await request(app)
        .get("/api/articles?topic=paper")
        .expect(200);
      expect(topicResponse.body.articles).toEqual([]);
      const authorResponse = await request(app)
        .get("/api/articles?author=lurker")
        .expect(200);
      expect(authorResponse.body.articles).toEqual([]);
    });
    test("GET 404: responds to the client with an error message when there are no articles matching the queried topic or author", async () => {
      const topicResponse = await request(app)
        .get("/api/articles?topic=dogs")
        .expect(404);
      expect(topicResponse.body.message).toBe(
        "No topic matching the topic query"
      );
      const authorResponse = await request(app)
        .get("/api/articles?author=banana")
        .expect(404);
      expect(authorResponse.body.message).toBe(
        "No author matching the author query"
      );
    });
    test("GET 200: responds to the client with an array of articles ordered and sorted to match provided queries", async () => {
      const response = await request(app)
        .get(
          "/api/articles?topic=mitch&author=icellusedkars&sort_by=title&order=asc"
        )
        .expect(200);
      const { body } = response;
      const { articles } = body;
      expect(articles.length).toBe(6);
      expect(articles).toBeSorted({ key: "title", descending: false });
    });
  });
  describe("GET /api/articles/:article_id/comments", () => {
    test("GET 200: responds to the client with an array of all comments for a given article, ordered by most recent comment first", async () => {
      const response = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);
      const { body } = response;
      const { comments } = body;
      expect(comments.length).toBe(11);
      comments.forEach((comment) => {
        expect(typeof comment.comment_id).toBe("number");
        expect(typeof comment.votes).toBe("number");
        expect(typeof comment.created_at).toBe("string");
        expect(typeof comment.author).toBe("string");
        expect(typeof comment.body).toBe("string");
        expect(comment.article_id).toBe(1);
      });
      expect(comments).toBeSorted({ key: "created_at", descending: true });
    });
    test("GET 200: responds to the client with an empty comments array when the article exists but has no associated comments", async () => {
      const response = await request(app)
        .get("/api/articles/10/comments")
        .expect(200);
      const { body } = response;
      const { comments } = body;
      expect(comments).toEqual([]);
    });
    test("GET 404: responds to the client with an error message when the article is is valid but not found", async () => {
      const response = await request(app)
        .get("/api/articles/1000/comments")
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No article matching the provided ID");
    });
    test("GET 400: responds to the client with an error message when the article id is invalid", async () => {
      const response = await request(app)
        .get("/api/articles/abc/comments")
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Invalid datatype for parameter");
    });
  });
  describe("POST /api/articles/:article_id/comments", () => {
    test("POST 201: responds to the client with an object containing the username and body of the comment", async () => {
      const commentToPost = { username: "lurker", body: "I agree!" };
      const response = await request(app)
        .post("/api/articles/13/comments")
        .send(commentToPost)
        .expect(201);
      const { body } = response;
      const { comment } = body;
      expect(Object.keys(comment).length).toBe(6);
      expect(comment).toMatchObject({
        comment_id: 19,
        body: "I agree!",
        article_id: 13,
        author: "lurker",
        votes: 0,
      });
      expect(typeof comment.created_at).toBe("string");
      const result = await db.query(
        `SELECT * FROM comments WHERE article_id = 13`
      );
      expect(result.rows.length).toBe(1);
    });
    test("POST 404: responds to the client with an error message when the article id is valid but not found", async () => {
      const commentToPost = { username: "lurker", body: "I agree!" };
      const response = await request(app)
        .post("/api/articles/1000/comments")
        .send(commentToPost)
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No article matching the provided ID");
    });
    test("POST 400: responds to the client with an error message when the article id is invalid", async () => {
      const commentToPost = { username: "lurker", body: "I agree!" };
      const response = await request(app)
        .post("/api/articles/abc/comments")
        .send(commentToPost)
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Invalid datatype for parameter");
    });
    test("POST 404: responds to the client with an error message when the article_id exists but the username provided does not exist in the users table", async () => {
      const commentToPost = { username: "not-a-valid-user", body: "I agree!" };
      const response = await request(app)
        .post("/api/articles/13/comments")
        .send(commentToPost)
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Username does not exist");
    });
    test("POST 400: responds to the client with an error message when the article_id exists but the username or body is not provided", async () => {
      const commentToPostWithoutBody = { username: "lurker" };
      const commentToPostWithoutUsername = { body: "I agree!" };
      const withoutBodyResponse = await request(app)
        .post("/api/articles/13/comments")
        .send(commentToPostWithoutBody)
        .expect(400);
      const withoutUsernameResponse = await request(app)
        .post("/api/articles/13/comments")
        .send(commentToPostWithoutUsername)
        .expect(400);

      expect(withoutBodyResponse.body.message).toBe(
        "Insufficient data provided"
      );
      expect(withoutUsernameResponse.body.message).toBe(
        "Insufficient data provided"
      );
    });
  });
  describe("PATCH /api/articles/:article_id", () => {
    test("PATCH 200: responds to the client with the updated article object when inc_votes is positive", async () => {
      const patchData = { inc_votes: 5 };
      const response = await request(app)
        .patch("/api/articles/1")
        .send(patchData)
        .expect(200);
      const { body } = response;
      const { article } = body;
      expect(article).toMatchObject({
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 105,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      });
    });
    test("PATCH 200: responds to the client with the updated article object when inc_votes is negative and even reduces the votes below zero", async () => {
      const patchData = { inc_votes: -105 };
      const response = await request(app)
        .patch("/api/articles/1")
        .send(patchData)
        .expect(200);
      const { body } = response;
      const { article } = body;
      expect(article).toMatchObject({
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: -5,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      });
    });
    test("PATCH 200: responds to the client with the unchanged article object when no patch data provided", async () => {
      const patchData = {};
      const response = await request(app)
        .patch("/api/articles/1")
        .send(patchData)
        .expect(200);
      const { body } = response;
      const { article } = body;
      expect(article).toMatchObject({
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      });
    });
    test("PATCH 404: responds to the client with an error message when the article_id is valid but does not exist", async () => {
      const patchData = { inc_votes: 5 };
      const response = await request(app)
        .patch("/api/articles/1000")
        .send(patchData)
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No article matching the provided ID");
    });
    test("PATCH 400: responds to the client with an error message when the article_id is invalid", async () => {
      const patchData = { inc_votes: 5 };
      const response = await request(app)
        .patch("/api/articles/abc")
        .send(patchData)
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Invalid datatype for parameter");
    });
    test("PATCH 400: responds to the client with an error message when the inc_votes patch value is invalid", async () => {
      const patchData = { inc_votes: "NaN" };
      const response = await request(app)
        .patch("/api/articles/abc")
        .send(patchData)
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("The value for inc_votes must be a number");
    });
  });
  describe("DELETE /api/comments/:comment_id", () => {
    test("DELETE 204: responds to the client with no content when deletion is successful", async () => {
      const response = await request(app)
        .delete("/api/comments/18")
        .expect(204);
      const { body } = response;
      expect(body).toEqual({});
      const result = await db.query(
        `SELECT * FROM comments WHERE article_id = 1`
      );
      expect(result.rows.length).toBe(10);
    });
    test("DELETE 404: responds to the client with an error message when the comment_id is valid but does not exist", async () => {
      const response = await request(app)
        .delete("/api/comments/1000")
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No comment matching the provided ID");
    });
    test("DELETE 400: responds to the client with an error message when the comment_id is invalid", async () => {
      const response = await request(app)
        .delete("/api/comments/abc")
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Invalid datatype for parameter");
    });
  });
  describe("GET /api/users", () => {
    test("GET 200: responds to the client with an array of users", async () => {
      const response = await request(app).get("/api/users").expect(200);
      const { body } = response;
      const { users } = body;
      users.forEach((user) => {
        expect(typeof user.username).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.avatar_url).toBe("string");
      });
    });
  });
  describe("GET /api/users/:username", () => {
    test("GET 200: responds to the client with a user with the username passed in as the parameter", async () => {
      const response = await request(app).get("/api/users/lurker").expect(200);
      const { body } = response;
      const { user } = body;
      expect(user).toMatchObject({
        username: "lurker",
        name: "do_nothing",
        avatar_url:
          "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
      });
    });
    test("GET 404: responds to the client with an error message if the username is valid but does not exist", async () => {
      const response = await request(app)
        .get("/api/users/not_a_user")
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No user matching the username provided");
    });
  });
  describe("PATCH /api/comments/:comment_id", () => {
    test("PATCH 200: responds to the client with the updated comment whether the inc_votes is positive or negative", async () => {
      const positivePatchData = { inc_votes: 1 };
      const positiveResponse = await request(app)
        .patch("/api/comments/1")
        .send(positivePatchData)
        .expect(200);
      expect(positiveResponse.body.comment).toMatchObject({
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 17,
        author: "butter_bridge",
        article_id: 9,
        created_at: "2020-04-06T12:17:00.000Z",
      });
      const negativePatchData = { inc_votes: -1 };
      const negativeResponse = await request(app)
        .patch("/api/comments/2")
        .send(negativePatchData)
        .expect(200);
      expect(negativeResponse.body.comment).toMatchObject({
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 13,
        author: "butter_bridge",
        article_id: 1,
        created_at: "2020-10-31T03:03:00.000Z",
      });
    });
    test("PATCH 200: responds to the client with the unmodified comment when the patch data is an empty object", async () => {
      const patchData = {};
      const response = await request(app)
        .patch("/api/comments/1")
        .send(patchData)
        .expect(200);
      expect(response.body.comment).toMatchObject({
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        article_id: 9,
        created_at: "2020-04-06T12:17:00.000Z",
      });
    });
    test("PATCH 404: responds to the client with an error message when the comment_id is valid but does not exist", async () => {
      const patchData = { inc_votes: 1 };
      const response = await request(app)
        .patch("/api/comments/1000")
        .send(patchData)
        .expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No comment matching the provided ID");
    });
    test("PATCH 400: responds to the client with an error message when the comment_id is invalid", async () => {
      const patchData = { inc_votes: 1 };
      const response = await request(app)
        .patch("/api/comments/abc")
        .send(patchData)
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("Invalid datatype for parameter");
    });
    test("PATCH 400: responds to the client with an error message when the inc_votes value is not a number", async () => {
      const patchData = { inc_votes: "NaN" };
      const response = await request(app)
        .patch("/api/comments/1")
        .send(patchData)
        .expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("The value for inc_votes must be a number");
    });
  });
  describe("POST /api/articles", () => {
    test("POST 201: responds to the client with the posted article using the default article_img_url when no url provided", async () => {
      const articleData = {
        title: "My First Article",
        topic: "paper",
        author: "lurker",
        body: "Hello everyone, my name is lurker and I have been a lurker for 200 days now.",
      };
      const response = await request(app)
        .post("/api/articles")
        .send(articleData)
        .expect(201);
      const { body } = response;
      const { article } = body;
      expect(article).toMatchObject({
        article_id: 14,
        title: "My First Article",
        topic: "paper",
        author: "lurker",
        body: "Hello everyone, my name is lurker and I have been a lurker for 200 days now.",
        votes: 0,
        article_img_url:
          "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
        comment_count: 0,
      });
      expect(typeof article.created_at).toBe("string");
    });
    test("POST 201: responds to the client with the posted article when a url is provided", async () => {
      const articleData = {
        title: "My First Article",
        topic: "paper",
        author: "lurker",
        body: "Hello everyone, my name is lurker and I have been a lurker for 200 days now.",
        article_img_url:
          "https://www.shutterstock.com/image-vector/two-pairs-eyes-dark-260nw-430264000.jpg",
      };
      const response = await request(app)
        .post("/api/articles")
        .send(articleData)
        .expect(201);
      const { body } = response;
      const { article } = body;
      expect(article).toMatchObject({
        article_id: 14,
        title: "My First Article",
        topic: "paper",
        author: "lurker",
        body: "Hello everyone, my name is lurker and I have been a lurker for 200 days now.",
        votes: 0,
        article_img_url:
          "https://www.shutterstock.com/image-vector/two-pairs-eyes-dark-260nw-430264000.jpg",
        comment_count: 0,
      });
      expect(typeof article.created_at).toBe("string");
    });
    test("POST 400: responds to the client with an error message when any of the required properties are not provided", async () => {
      const requiredProperties = ["title", "topic", "author", "body"];
      const articleData = {
        title: "My First Article",
        topic: "paper",
        author: "lurker",
        body: "Hello everyone, my name is lurker and I have been a lurker for 200 days now.",
      };
      const promisesArray = requiredProperties.map((property) => {
        const articleCopy = { ...articleData };
        delete articleCopy[property];
        return request(app).post("/api/articles").send(articleCopy);
      });
      const responsesArray = await Promise.all(promisesArray);
      responsesArray.forEach((response) => {
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Insufficient data provided");
      });
    });
  });
  describe("POST /api/topics", () => {
    test("POST 201: responds to the client with the posted topic", async () => {
      const topicData = {
        slug: "tarantulas",
        description: "chunky, fuzzy, and cute",
      };
      const response = await request(app).post("/api/topics").send(topicData);
      const { body } = response;
      const { topic } = body;
      expect(topic).toEqual({
        slug: "tarantulas",
        description: "chunky, fuzzy, and cute",
      });
    });
    test("POST 201: responds to the client with the topic if only the slug is provided", async () => {
      const topicData = { slug: "tarantulas" };
      const response = await request(app)
        .post("/api/topics")
        .send(topicData)
        .expect(201);
      const { body } = response;
      const { topic } = body;
      expect(topic).toEqual({
        slug: "tarantulas",
      });
    });
    test("POST 400: responds to the client with an error message when the slug is not provided", async () => {
      const topicData = { description: "chunky, fuzzy, and cute" };
      const response = await request(app)
        .post("/api/topics")
        .send(topicData)
        .expect(400);
      expect(response.body.message).toBe("Insufficient data provided");
    });
  });
  describe("DELETE /api/articles/:article_id", () => {
    test("DELETE 204: responds to the client with no content when deletion is sucessful", async () => {
      const response = await request(app).delete("/api/articles/1").expect(204);
      expect(response.body).toEqual({});
      const result = await db.query(
        `SELECT * FROM comments WHERE article_id = 1`
      );
      expect(result.rows.length).toBe(0);
    });
    test("DELETE 404: responds to the client with an error message when the article_id is valid but not found", async () => {
      const response = await request(app)
        .delete("/api/articles/1000")
        .expect(404);
      expect(response.body.message).toBe("No article matching the provided ID");
    });
    test("DELETE 400: responds to the client with an error message when the article_id is invalid", async () => {
      const response = await request(app)
        .delete("/api/articles/abc")
        .expect(400);
      expect(response.body.message).toBe("Invalid datatype for parameter");
    });
  });
});

// check pipeline is working
