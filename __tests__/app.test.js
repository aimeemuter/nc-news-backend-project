const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const endpointsData = require("../endpoints.json");
const { describe, test, expect } = require("@jest/globals");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("invalid endpoint url", () => {
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
  describe("/api", () => {
    test("GET 200: responds to the client with an object describing all the available endpoints", async () => {
      const response = await request(app).get("/api").expect(200);
      const { body } = response;
      const { apiInfo } = body;
      expect(typeof apiInfo).toBe("object");
      expect(apiInfo).toEqual(endpointsData);
    });
  });
  describe("/api/topics", () => {
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
  describe("/api/articles/:article_id", () => {
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
  describe("/api/articles", () => {
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
        `SELECT * FROM comments WHERE article_id = $1`,
        [13]
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
    test("POST 400: responds to the client with an error message when the article_id exists but the username provided does not exist in the users table", async () => {
      const commentToPost = { username: "not-a-valid-user", body: "I agree!" };
      const response = await request(app)
        .post("/api/articles/13/comments")
        .send(commentToPost)
        .expect(400);
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
    // happy path
    // check article valid but doesn't exist
    // check article invalid
    // check newVote invalid
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
});
