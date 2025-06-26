
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

module.exports = findUser;