var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieParser());

//below is implementing the func generateRandomString()

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

//URL datastore
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//user datastore
const users = {
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
}

// const user_id = users.id

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log("welcome to /urls, have a nice day");
  console.log(users);
  console.log(req.cookies["user_id"]);
  console.log(users[req.cookies["user_id"]]);
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]
 };
  res.render("urls_show", templateVars);
});

//registration
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

//login
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls", (req, res) => {
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`http://localhost:1234/urls/${randomShortURL}`);
});

//delete an individual URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//update URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//the login
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = Object.values(users).find((usr)=>{return (usr.email === email);})
  if (!user){
    return res.sendStatus(403)
  }
    //if doesn't match email --> 403
  if (user.password !== password) {
    return res.sendStatus(403)
  }
    //if doesn't match pw of existing email -->403

  res.cookie("user_id", user.id);
  res.redirect("/urls");
    //if both pass set user_id cookie w/ matching user's random ID
})

//the logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//registration
app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const {email, password} = req.body;

  console.log(users[randomUserID]);
  if (!email || !password) {
    return res.sendStatus(400)
  }
  const user = Object.values(users).find((usr)=>{return (usr.email === email);})
  if (user) {
    return res.sendStatus(400)
  }
  users[randomUserID] = {
    id: randomUserID,
    email: email,
    password: password
  };
  res.cookie("user_id", randomUserID);
  return res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

