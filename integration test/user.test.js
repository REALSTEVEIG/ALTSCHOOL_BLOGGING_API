const supertest = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/userModel");
require("dotenv").config({ path: "./config.env" });
jest.setTimeout(20000);

describe("User routes", () => {
  let user;
  beforeAll(async () => {
    mongoose
      .connect(process.env.TEST_MONGO_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
      .then(() => {
        console.log("DB connection successful!");
      })
      .catch((err) => {
        console.log("could not connect to MongoDB");
        console.log(err);
      });
    user = await User.create({
      first_name: "test",
      last_name: "test",
      email: "test6@gmail.com",
      password: "testtesttest",
      passwordConfirm: "testtesttest",
    });
  });

  afterAll(async () => {
    await User.deleteMany();
    await mongoose.connection.close();
  });
  it("should get all users", async () => {
    const response = await supertest(app).get("/api/v1/users");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("users");
    expect(response.body.data.users.length).toBeGreaterThan(0);
  });
  it("should get a user", async () => {
    const response = await supertest(app).get(`/api/v1/users/${user.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "success");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user).toHaveProperty("first_name", "test");
    expect(response.body.data.user).toHaveProperty("last_name", "test");
  });
});
