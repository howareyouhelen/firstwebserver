var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
var express = require('express')
app.set("view engine", "ejs");


app.use(cookieSession({
  secret: 'minion',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))




function userFinder (object) {
  for (var uid in users) {
    if (users[uid].email === object) {
      return users[uid];
    }
  }
  return undefined;
};
function passwordFinder (object) {
  for (var uid in users) {
    if (users[uid].password === object) {
      return users[uid];
    }
  }
  return undefined;
};

//below is implementing the func generateRandomString()

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
// var user_id = req.cookies.user_id
//URL datastore

function urlsForUser(userID) {
  var listOfCreatorURL = {};
  for (var shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].creator) {
      listOfCreatorURL[shortURL] = urlDatabase[shortURL];
    }
  }
  return listOfCreatorURL;
}

  // make an empty array
  // loop through the urlDatabase
  // for each one, if it belongs to the user in question, push it
  // otherwise ignore it
  // return the generated array


var urlDatabase = {
  "9sm5xK": {
    longURL: "http://www.google.com",
    creator: "user@example.com"
  }
}
// var urlDatabase = {
//   "userID":{
//     "9sm5xK": "http://www.google.com",
//     "b2xVn2": "http://www.lighthouselabs.ca"
//   }
// };

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
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session["user_id"]]
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  for (var key in urlDatabase) {
    if (key === req.params.shortURL) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      res.redirect(longURL);
    }
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.session["user_id"]]
 };
 if (urlDatabase[req.params.id].creator === req.session["user_id"]) {
  res.render("urls_show", templateVars);
  } else {
  res.send("Please login to see your data");
  }
});

//registration
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

//login
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//new URL
app.post("/urls", (req, res) => {
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = {
    "longURL": req.body.longURL,
    "creator": req.session["user_id"]
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${randomShortURL}`);
});

//delete an individual URL
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.send("Record does not exist");
  } else if (urlDatabase[req.params.id].creator === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("You didn't make this url!");
  }
});
//start off w/ empty obj, for loop, if match with creator we will add it into the empty obj(aka temp var)

//update URL
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.send("Record does not exist");
  } else if (urlDatabase[req.params.id].creator === req.session["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("You didn't make this url!");
  }
});

//the login
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = userFinder(email);
  const hashed_password = bcrypt.hashSync(password, 10);
  const userpass = passwordFinder(password);
  if (!user) {
    return res.sendStatus(403)
  } else {
    if (!bcrypt.compareSync(password, hashed_password)) {
      return res.sendStatus(403)
    }
  }
    //if doesn't match pw of existing email -->403
  req.session.user_id = user.id;
  res.redirect("/urls");
    //if both pass set user_id cookie w/ matching user's random ID
})

//the logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

//registration
app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const {email, password} = req.body;
  const oripassword = password;
  const hashed_password = bcrypt.hashSync(oripassword, 10);

  console.log(users[randomUserID]);
  if (!email || !password) {
    return res.sendStatus(400)
  }
  if (!!userFinder(email)) {
    return res.sendStatus(400)
  }

  users[randomUserID] = {
    id: randomUserID,
    email: email,
    password: hashed_password
  };
  req.session.user_id = randomUserID;
  return res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

