const request = require("supertest");
const crypto = require("node:crypto");

const app = require("../src/app");
const database = require("../database");

afterAll(() => database.end());

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  const newUser = {
    firstname: "Marie",
    lastname: "Martin",
    email: `${crypto.randomUUID()}@wild.co`,
    city: "Paris",
    language: "French",
  };

  it("should return created user", async () => {
    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toEqual(201);

    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toEqual("number");

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toEqual(newUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toEqual(newUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toEqual(newUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toEqual(newUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toEqual(newUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Marie" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const [result] = await database.query(
      "INSERT INTO users (firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.city,
        newUser.language,
      ]
    );

    const id = result.insertId;

    const updatedUser = {
      firstname: "Martin",
      lastname: "Marie",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "London",
      language: "English",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.status).toEqual(200);

    const [results] = await database.query(
      "SELECT * FROM users WHERE id=?",
      id
    );

    const [userInDatabase] = results;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(userInDatabase.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(userInDatabase.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(userInDatabase.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(userInDatabase.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(userInDatabase.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Marie" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});
