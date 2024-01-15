const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("invalid endpoint url", () => {
  it("404: responds with not found if endpoint not hit", async () => {
    const response = await request(app).get("/nonsense").expect(404);
    const { status } = response;
    expect(status).toBe(404);
  });
});

describe("app.js", () => {
  describe("/api/topics", () => {
    it("GET 200: responds to the client with an array of topics", async () => {
      const response = await request(app).get("/api/topics").expect(200);
      const { body } = response;
      const { topics } = body;
      expect(topics.length).toBe(3);
      topics.forEach((topic) => {
        expect(topic.hasOwnProperty("description"));
        expect(typeof topic.description).toBe("string");
        expect(topic.hasOwnProperty("slug"));
        expect(typeof topic.slug).toBe("string");
      });
    });
  });
});
