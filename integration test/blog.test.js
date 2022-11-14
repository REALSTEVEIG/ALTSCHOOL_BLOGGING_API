const supertest = require("supertest");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const app = require("../app");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

jest.setTimeout(20000);

describe("Auth routes", () => {
  // let conn;
  let author;
  let token;
  let oneBlog;
  beforeAll(async () => {
    await mongoose
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
    const user = await User.create({
      first_name: "test",
      last_name: "test",
      email: "test2@gmail.com",
      password: "testtesttest",
      passwordConfirm: "testtesttest",
    });
    author = user;
    const loginResponse = await supertest(app)
      .post("/api/v1/users/login")
      .set("Content-Type", "application/json")
      .send({ email: "test2@gmail.com", password: "testtesttest" });
    token = loginResponse._body.token;
  });
  beforeEach(async () => {
    const blog = await Blog.create({
      title: "test",
      description: "test",
      author: author.id,
      state: "published",
      tags: ["test"],
      body: "test",
    });
    oneBlog = blog;
  });

  afterEach(async () => {
    await Blog.deleteMany();
  });
  afterAll(async () => {
    await User.deleteMany();
    await Blog.deleteMany();

    await mongoose.connection.close();
  });
  it("Should get all blogs from the database", async () => {
    const response = await supertest(app).get("/api/v1/blogs");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
  });
  it("Should get all blogs from the database and filter by author", async () => {
    const response = await supertest(app).get(
      `/api/v1/blogs?author=${author.id}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.blogs).toBeTruthy();
  });
  it("Should get all blogs from the database and filter by tags", async () => {
    const response = await supertest(app).get(`/api/v1/blogs?tags=test`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.blogs).toBeTruthy();
  });
  it("Should get all blogs from the database and filter by state", async () => {
    const response = await supertest(app).get(`/api/v1/blogs?state=published`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.blogs).toBeTruthy();
  });
  it("Should get one blogs by id from the database", async () => {
    const response = await supertest(app).get(`/api/v1/blogs/${oneBlog.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.blog).toBeTruthy();
    expect(response.body.data.blog.author.first_name).toBe("test");
    expect(response.body.data.blog.author).toBeTruthy();
  });
  it("Should only update blog if its the owner requesting", async () => {
    const response = await supertest(app)
      .patch(`/api/v1/blogs/${oneBlog.id}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({ state: "draft" });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.updatedBlog).toBeTruthy();
    expect(response.body.data.updatedBlog.state).toBe("draft");
    expect(response.body.data.updatedBlog.author).toBeTruthy();
  });

  it("Should only create blog if user is logged in", async () => {
    const response = await supertest(app)
      .post(`/api/v1/blogs/`)
      .set("Content-Type", "application/json")
      .set("authorization", `Bearer ${token}`)
      .send({
        title: "test2",
        description: "test",
        state: "draft",
        tags: ["test"],
        body: "test",
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.blog).toBeTruthy();
    expect(response.body.data.blog.title).toBe("test2");
    expect(response.body.data.blog.author).toBeTruthy();
    expect(response.body.data.blog.author).toBe(author.id);
  });

  it("Should only delete blog if its the owner requesting", async () => {
    const response = await supertest(app)
      .delete(`/api/v1/blogs/${oneBlog.id}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    expect(response.statusCode).toBe(204);
  });
  it("Should get user blogs", async () => {
    const response = await supertest(app)
      .get(`/api/v1/blogs/getMyBlogs`)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toStrictEqual("success");
    expect(response.body.data.blogs).toBeTruthy();
  });
});
