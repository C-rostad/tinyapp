const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const { findUser, setTemplateVars, generateRandomString, urlsForUser } = require('./functions.js');
const bcrypt = require("bcryptjs");

app.use(cookieSession({
  name: 'session',
  keys: ['dfe9f2a5d3622d6ec47b5a91d9c380b0f0d1e4206d905e96d87e5dfdc1a4c457'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};



const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  aJ48lW : {
    id: "aJ48lW",
    email: "carter@rostad.ca",
    password: bcrypt.hashSync("123", 10)
  }
};


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = setTemplateVars(req, users, urlDatabase);
  if (templateVars.email) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const user = findUser(req.body.email, users);
  if (!user) {
    return res.status(403).send("Error: No user with that email found.");
  }
  
  if (!bcrypt.compareSync(req.body.password, user.password)) { //user.password !== req.body.password
    return res.status(403).send("Error: Incorrect password.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = setTemplateVars(req, users, urlDatabase);
  if (templateVars.email) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res)  => {
  const userID = generateRandomString();
  console.log(findUser(req.body.email, users));
  if (findUser(req.body.email, users)) { //check if email is in users object already
    console.log("Here");
   return res.status(400).send("Error! User with that email already exists");
  };

  if (req.body.password.length === 0) {
   return res.status(400).send("Error: no password input");
  }

  if (req.body.email.length === 0) {
    return res.status(400).send("Error: no email input");
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = userID;
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  if (templateVars.email) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.post("/urls", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
if (!templateVars.email) {
  return res.status(403).send("<h3>Error: You must be logged in to shorten URLs.</h3>");
}
let newId = generateRandomString();
while (Object.keys(urlDatabase).includes(newId)) { //check if key already exists, if so make new one
  newId = generateRandomString();
}

  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userIdCookie = req.session.user_id;
  const urlUserId = urlDatabase[id].userID;
  if (userIdCookie === "undefined" || ! userIdCookie) { //check if user is logged in
    return res.status(403).send("<h3>Error: You must be logged in to view your shortenedURLs.</h3>");
  };

  const urlEntry = urlDatabase[id];
  if (!urlEntry) { //check if entry exists
    return res.status(404).send("<h3>Error: Short URL does not exist.</h3>");
  };

  if (userIdCookie !== urlUserId) { //check if user owns the entry
    return res.status(403).send("<h3>Error: You must have created the short URL to use it.</h3>");
  };
  const templateVars = {
    ...setTemplateVars(req, users, urlDatabase),
    id: id,
    longURL: urlEntry.longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.longURL;
  const userIdCookie = req.session.user_id;
  const urlEntry = urlDatabase[id];

  if (!urlEntry) { //check if entry exists
    return res.status(404).send("<h3>Error: Short URL does not exist.</h3>");
  }

  if (userIdCookie === "undefined" || !userIdCookie) { //check if user is logged in
    return res.status(403).send("<h3>Error: You must be logged in to view your shortenedURLs.</h3>");
  };

  if (urlEntry.userID !== userIdCookie) { //check if user owns the entry
    return res.status(403).send("<h3>Error: You must have created the short URL to use it.</h3>");
  };

  console.log("Changing longURL for " + id + " to " + newUrl);
  urlDatabase[id].longURL = newUrl;
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userIdCookie = req.session.user_id;
  const urlEntry =  urlDatabase[id];

  if (!urlEntry) { //check if url exists
    return res.status(404).send("<h3>Error: Short URL does not exist.</h3>");
  }

  if (!userIdCookie || userIdCookie === "undefined") { //check if user is logged in
    return res.status(403).send("<h3>Error: You must be logged in to delete URLs.</h3>");
  }

  if (urlEntry.userID !== userIdCookie) { //check if user owns the entry
    return res.status(403).send("<h3>Error: You do not have permission to delete this URL.</h3>");
  }

  //delete url
  console.log("Deleting:" + id);
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});