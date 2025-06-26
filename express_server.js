const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { findUser, setTemplateVars, generateRandomString } = require('./functions.js');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
};


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("login", templateVars);
})
app.post("/login", (req, res) => {
  const user = findUser(req.body.email, users);
  console.log(user);
  console.log(req.body.email);
  if (!user) {
    return res.status(403).send("Error: No user with that email found.");
  }

  if (user.password !== req.body.password) {
    return res.status(403).send("Error: Incorrect password.");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("register", templateVars);
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
    password: req.body.password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
let newId = generateRandomString();
while (Object.keys(urlDatabase).includes(newId)) { //check if key already exists, if so make new one
  newId = generateRandomString();
}

  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  console.log("Changing longURL for " + req.params.id + " to " + req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("Deleting:" + req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});