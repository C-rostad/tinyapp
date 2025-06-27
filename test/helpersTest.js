const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined when given an email not in the database', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
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

