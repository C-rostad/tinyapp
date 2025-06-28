
/**
 * Searches the users object for a user with the given email.
 * @param {string} userEmail - The email to look for.
 * @param {Object} users - The users database object.
 * @returns {Object|false|undefined} - Returns the user object if found, false if not found,
 *                                    or undefined if inputs are invalid.
 */
const getUserByEmail = function(userEmail, users) {
  // Return undefined if email or users data is missing
  if (!userEmail || !users) {
    return undefined;
  }

  // Iterate through users to find a matching email
  for (const key in users) {
    if (users[key].email === userEmail) {
      return users[key]; // Return the user object if email matches
    }
  }

  // Return false if no user with the email exists
  return false;
};

/**
 * Constructs template variables for rendering views,
 * including URLs owned by the logged-in user and their email.
 * @param {Object} req - The Express request object (with session).
 * @param {Object} users - The users database object.
 * @param {Object} urlDatabase - The URL database object.
 * @returns {Object} - An object containing 'urls' and 'email' for templates.
 */
const setTemplateVars = function(req, users, urlDatabase) {
  const idCookie = req.session.userId; // Get logged-in user ID from session cookie
  let email = "";

  // If user exists, get their email
  if (users[idCookie]) {
    email = users[idCookie].email;
  }

  // Prepare template variables: urls owned by user and user email
  const templateVars = {
    urls: getUrlsForUser(idCookie, urlDatabase),
    email: email
  };
  return templateVars;
};

/**
 * Generates a random 6-character alphanumeric string.
 * @returns {string} - A random string of length 6.
 */
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6;

  // Loop to select random characters from the allowed set
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result = result.concat(characters[randomIndex]);
  }

  return result;
};

/**
 * Filters the URL database to return only URLs owned by the specified user.
 * @param {string} userId - The ID of the user.
 * @param {Object} urlDatabase - The URL database object.
 * @returns {Object} - A subset of the urlDatabase containing only user's URLs.
 */
const getUrlsForUser = function(userId, urlDatabase) {
  const userURLs = {};

  // Iterate over all URLs and pick those that belong to userId
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === userId) {
      userURLs[urlId] = urlDatabase[urlId];
    }
  }

  return userURLs;
};

module.exports = {
  getUserByEmail,
  setTemplateVars,
  generateRandomString,
  getUrlsForUser
};