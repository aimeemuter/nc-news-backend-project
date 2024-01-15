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
    test("GET 404: responds to the client with an error message", async () => {
      const response = await request(app).get("/api/articles/1000").expect(404);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("No article matching the provided ID");
    });
    test("GET 400: responds to the client with an error message", async () => {
      const response = await request(app).get("/api/articles/abc").expect(400);
      const { body } = response;
      const { message } = body;
      expect(message).toBe("The article ID must be a number");
    });
  });
  describe("/api/articles", () => {
    test("GET 200: responds to the client with an array of articles", async () => {
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
});
