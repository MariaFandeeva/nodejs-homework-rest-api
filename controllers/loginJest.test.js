const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

const app = require("../app");

const { DB_HOST } = process.env;

beforeAll(() => {
  mongoose.connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

mongoose.set("strictQuery", false);

describe("POST /login", () => {
  const credentials = {
    email: "mfandeeva@getMaxListeners.com",
    password: "mfandeeva86",
  };

  test("Should return status 200", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send(credentials);
    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(typeof response.body).toBe("object");
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });

  test("Should return 400 Bad request if email or password is missing", async () => {
    const response = await (
      await request(app).post("/api/users/login")
    ).setEncoding();

    expect(response.status).toBe(400);
  });
}, 30000);

afterAll(async () => {
  await mongoose.connection.close();
});
