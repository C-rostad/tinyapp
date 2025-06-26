const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const idCookie = req.cookies["user_id"]
  let username = ""
  if (users[idCookie]) {
    username = users[idCookie].email
  }
  const templateVars = { 
    urls: urlDatabase, 
    username: username
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const idCookie = req.cookies["user_id"]
  let username = ""
  if (users[idCookie]) {
    username = users[idCookie].email
  }
  const templateVars = { 
    username: username
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res)  => {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  const idCookie = req.cookies["user_id"]
  let username = ""
  if (users[idCookie]) {
    username = users[idCookie].email
  }
  const templateVars = {
    username: username
  }
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
  const idCookie = req.cookies["user_id"]
  let username = ""
  if (users[idCookie]) {
    username = users[idCookie].email
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: username
  };
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