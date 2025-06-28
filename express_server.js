const express = require("express");
const app = express();
const PORT = 8080; // default port for server
const cookieSession = require('cookie-session');
const { getUserByEmail, setTemplateVars, generateRandomString } = require('./helpers.js');
const bcrypt = require("bcryptjs");

// Configure cookie-session middleware to manage session cookies
app.use(cookieSession({
  name: 'session',
  keys: ['dfe9f2a5d3622d6ec47b5a91d9c380b0f0d1e4206d905e96d87e5dfdc1a4c457'], // Secret key for encryption

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000  // Set cookie to expire after 24 hours
}));

// Middleware to parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating/view engine
app.set("view engine", "ejs");

// In-memory "database" to store shortened URLs and associated user IDs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};


// In-memory "database" to store users, with id, email, and hashed password
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
};

// Root route redirects users to the main URLs page if logged in, login page if not
app.get("/", (req, res) => {
  const userId = req.session.userId;

  if(userId && users[userId]) { 
    res.redirect("/urls");
  }
  else {
    res.redirect("/login");
  }
});

// Render login page or redirect logged-in users to /urls
app.get("/login", (req, res) => {
  const templateVars = setTemplateVars(req, users, urlDatabase);
  if (templateVars.email) {    // User already logged in, redirect to URLs page
    res.redirect("/urls");
  } else { // Show login form
    res.render("login", templateVars);
  }
});

// Handle login form submission
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {  // Check if user exists
    return res.status(403).send("Error: No user with that email found.");
  }
  
  if (!bcrypt.compareSync(req.body.password, user.password)) {   // Verify password using bcrypt
    return res.status(403).send("Error: Incorrect password.");
  }
  req.session.userId = user.id; // Set userId in session cookie to keep user logged in
  res.redirect("/urls");
});

// Log out the user by clearing session cookie and redirect to login page
app.post("/logout", (req, res) => {
  req.session['userId'] = null;
  res.redirect("/login");
});

// Display list of URLs for logged-in user
app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  if (!userId) { //CODE REVIEW HERE - REDIRECT TO LOGIN???
    return res.status(403).send("Error: Must be logged in to visit urls page");
  }


  const templateVars = setTemplateVars(req, users, urlDatabase);
  res.render("urls_index", templateVars);
});

// Render registration form or redirect logged-in users to /urls
app.get("/register", (req, res) => {
  const templateVars = setTemplateVars(req, users, urlDatabase);
  if (templateVars.email) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// Handle registration form submission
app.post("/register", (req, res)  => {
  const userID = generateRandomString();
  if (getUserByEmail(req.body.email, users)) { // Prevent duplicate registration with existing email
    return res.status(400).send("Error! User with that email already exists");
  }

  if (req.body.password.length === 0) { // Validate password presence
    return res.status(400).send("Error: no password input");
  }

  if (!req.body.email) { // Validate email presence
    return res.status(400).send("Error: no email input");
  }

  users[userID] = { // Store new user with hashed password
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.userId = userID; // Log in newly registered user by setting session cookie
  res.redirect("/urls");
});

// Render form for creating a new short URL (only for logged-in users)
app.get("/urls/new", (req, res) => {
  const templateVars = setTemplateVars(req, users, urlDatabase);
  if (templateVars.email) {
    res.render("urls_new", templateVars);
  } else {// Redirect unauthenticated users to login page
    res.redirect("/login");
  }
  
});

// Handle submission of new long URL to be shortened
app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const templateVars = setTemplateVars(req, users, urlDatabase);
  if (!templateVars.email) { // Require user to be logged in
    return res.status(403).send("<h3>Error: You must be logged in to shorten URLs.</h3>");
  }
  let newId = generateRandomString(); // Generate a unique short URL ID
  while (Object.keys(urlDatabase).includes(newId)) { //check if key already exists, if so make new one
    newId = generateRandomString();
  }

  urlDatabase[newId] = {// Store the new short URL with the associated userId
    longURL: req.body.longURL.startsWith('http') ? req.body.longURL : `http://${req.body.longURL}`,
    userId,
  }
  res.redirect(`/urls/${newId}`); // Redirect user to the page for the new short URL
});

// Show details/edit page for a specific short URL (only accessible by owner)
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId;

  console.log("Requested ID:", id);
  console.log("Current DB keys:", Object.keys(urlDatabase));
  console.log("Matching entry:", urlDatabase[id]);

  if (!userId) {
    return res.status(403).send("<h3>Error: You must be logged in to view your shortened URLs.</h3>");
  }

  const urlEntry = urlDatabase[id];

  if (!urlEntry) {
    return res.status(404).send("<h3>Error: Short URL does not exist.</h3>");
  }

  if (userId !== urlEntry.userId) {
    return res.status(403).send("<h3>Error: You must have created the short URL to view it.</h3>");
  }

  const templateVars = {
    ...setTemplateVars(req, users, urlDatabase),
    id,
    longURL: urlEntry.longURL
  };

  res.render("urls_show", templateVars);
});

// Handle update of long URL for a specific short URL (only owner can update)
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.longURL;
  const userId = req.session.userId;
  const urlEntry = urlDatabase[id];

  if (!urlEntry) {
    return res.status(404).send("<h3>Error: Short URL does not exist.</h3>");
  }

  if (!userId) {
    return res.status(403).send("<h3>Error: You must be logged in to view your shortened URLs.</h3>");
  }

  if (urlEntry.userId !== userId) {
    return res.status(403).send("<h3>Error: You must have created the short URL to use it.</h3>");
  }

  // Sanitize input just like when creating new URLs
  urlDatabase[id].longURL = newUrl.startsWith("http") ? newUrl : `http://${newUrl}`;
  console.log(`Updated longURL for ${id} to ${urlDatabase[id].longURL}`);
  res.redirect(`/urls/${id}`);
});

// Redirect visitors from short URL to the original long URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("<h3>Error: Url does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Handle deletion of a short URL (only by owner)
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId;
  const urlEntry =  urlDatabase[id];
  console.log(urlEntry);
  console.log(userId);

  if (!urlEntry) {// Verify short URL exists
    return res.status(404).send("<h3>Error: Short URL does not exist.</h3>");
  }

  if (!userId || userId === "undefined") { // Verify user is logged in
    return res.status(403).send("<h3>Error: You must be logged in to delete URLs.</h3>");
  }

  if (urlEntry.userId !== userId) { // Verify logged-in user owns the URL
    return res.status(403).send("<h3>Error: You do not have permission to delete this URL.</h3>");
  }

 // Delete the short URL from database
  console.log("Deleting:" + id);
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});