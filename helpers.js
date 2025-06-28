
//checks user object for userEmail, if it exists return the user, if not return false
const getUserByEmail = function(userEmail, users) {
  if (!userEmail || !users) {
    return undefined; // invalid input
  }

  for (const key in users) {
    if (users[key].email === userEmail) {
      return users[key]; // match found
    }
  }

  return false; // email not found
};

const setTemplateVars = function (req, users, urlDatabase) {
  const idCookie = req.session.user_id
  let email = ""
  if (users[idCookie]) {
    email = users[idCookie].email
  }
  const templateVars = { 
    urls: getUrlsForUser(idCookie, urlDatabase), 
    email: email
  };
  return templateVars;
}

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result = result.concat(characters[randomIndex]); 
  }
  return result;
}

const getUrlsForUser = function(userId, urlDatabase) {
  const userURLs = {};
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