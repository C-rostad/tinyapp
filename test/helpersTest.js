const { assert } = require('chai');

const { getUserByEmail, getUrlsForUser, setTemplateVars, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user123" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "user456" }
};

// Tests for getUserByEmail helper function
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return false when given an email not in the database', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.strictEqual(user, false);
  });

  it('should return undefined when given an empty email string', function() {
    const user = getUserByEmail("", testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined when given null as email', function() {
    const user = getUserByEmail(null, testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined when given undefined as email', function() {
    const user = getUserByEmail(undefined, testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined when users object is missing', function() {
    const user = getUserByEmail("user@example.com", null);
    assert.isUndefined(user);
  });
  
});

// Tests for getUrlsForUser helper function
describe('getUrlsForUser', () => {

  it('should return URLs that belong to the specified user', () => {
    const result = getUrlsForUser("user123", testUrlDatabase);
    const expected = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user123" }
    };
    assert.deepEqual(result, expected);
  });

  it('should return an empty object if the user has no URLs', () => {
    const result = getUrlsForUser("user789", testUrlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', () => {
    const result = getUrlsForUser("user123", {});
    assert.deepEqual(result, {});
  });

  it('should not return URLs that don’t belong to the specified user', () => {
    const result = getUrlsForUser("user123", testUrlDatabase);
    assert.notProperty(result, "9sm5xK"); // belongs to user456
  });

});

//Tests for setTemplateVars helper function
describe('setTemplateVars', () => {
  const users = {
    "user1": { id: "user1", email: "user1@example.com" },
    "user2": { id: "user2", email: "user2@example.com" }
  };

  const urlDatabase = {
    "url1": { longURL: "http://a.com", userId: "user1" },
    "url2": { longURL: "http://b.com", userId: "user2" },
    "url3": { longURL: "http://c.com", userId: "user1" }
  };

  it('should return templateVars with urls and email when user is logged in', () => {
    const req = { session: { userId: "user1" } };
    const result = setTemplateVars(req, users, urlDatabase);
    assert.deepEqual(result.urls, {
      "url1": { longURL: "http://a.com", userId: "user1" },
      "url3": { longURL: "http://c.com", userId: "user1" }
    });
    assert.strictEqual(result.email, "user1@example.com");
  });

  it('should return empty urls and empty email if userId cookie not in users', () => {
    const req = { session: { userId: "nonexistentUser" } };
    const result = setTemplateVars(req, users, urlDatabase);
    assert.deepEqual(result.urls, {});
    assert.strictEqual(result.email, "");
  });

  it('should return empty email if session has no userId', () => {
    const req = { session: {} };
    const result = setTemplateVars(req, users, urlDatabase);
    assert.deepEqual(result.urls, {});
    assert.strictEqual(result.email, "");
  });
});

//Tests for generateRandomString helper function
describe('generateRandomString', () => {
  it('should generate a string of length 6', () => {
    const result = generateRandomString();
    assert.strictEqual(result.length, 6);
  });

  it('should only contain alphanumeric characters', () => {
    const result = generateRandomString();
    assert.match(result, /^[A-Za-z0-9]{6}$/);
  });

  it('should generate different strings on consecutive calls', () => {
    const result1 = generateRandomString();
    const result2 = generateRandomString();
    // This test might occasionally fail but is unlikely
    assert.notStrictEqual(result1, result2);
  });
});