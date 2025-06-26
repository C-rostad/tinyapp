
//checks user object for userEmail, if it exists return the user, if not return false
const findUser = function (userEmail, users) {
  if (!userEmail || !users) {
    return null;
  }
  for (const key in users) {
    if (users[key]["email"] === userEmail) {
      return users[key];
    }
  }
  return false;
};

const setTemplateVars = function (req, users, urlDatabase) {
  const idCookie = req.cookies["user_id"]
  let email = ""
  if (users[idCookie]) {
    email = users[idCookie].email
  }
  const templateVars = { 
    urls: urlDatabase, 
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


module.exports = {
  findUser,
  setTemplateVars,
  generateRandomString
  };