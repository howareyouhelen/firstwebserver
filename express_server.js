var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser());
app.use(cookieSession({
    name: "session",
    secret: 'minion',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

function userFinder(object) {
    for (var id in users) {
        if (users[id].email === object) {
            return users[id];
        }
    }
    return undefined;
};

function passwordFinder(object) {
    for (var id in users) {
        if (users[id].password === object) {
            return users[id];
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
};

//check if creator of the shorturl matches the one logged in
function creator(data, user, shortURL) {
    let userURL = false;
    for (let key in data) {
        if (data[user.id][shortURL]) {
            userURL = true;
        }
    }
    return userURL;
}

const urlDatabase = {};

//user datastore
const users = {};

//get root
app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect('/urls');
    } else {
        res.redirect('/login');
    }
});

//get index
app.get("/urls", (req, res) => {
    const userLogged = req.session.user;
    if (!userLogged) {
        res.render("urls_not_found");
    }
    let templateVars = {
        urls: urlDatabase[userLogged.id],
        user: userLogged
    };
    res.render("urls_index", templateVars);
});

//get new url insert
app.get("/urls/new", (req, res) => {
    const userLogged = req.session.user;
    if (!userLogged) {
        res.redirect('/login');
    }
    let templateVars = {
        user: userLogged
    };
    res.render("urls_new", templateVars);
});

//get to longurl site 
app.get("/u/:shortURL", (req, res) => {
    for (let id in users) {
        if (urlDatabase[id][req.params.shortURL]) {
            const longURL = urlDatabase[id][req.params.shortURL];
            res.redirect(longURL);
        }
    }
    res.sendStatus(404);
});

//get shorturl's summary
app.get("/urls/:id", (req, res) => {
    const userLogged = req.session.user;
    if (!userLogged) {
        res.sendStatus(403);
    }
    if (!urlDatabase[userLogged.id][req.params.id]) {
        res.sendStatus(404);
    }
    if (!creator(urlDatabase, userLogged, req.params.id)) {
        res.sendStatus(403);
    }
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[userLogged.id][req.params.id],
        user: userLogged
    };
    res.render("urls_show", templateVars);
});

//new URL
app.post("/urls", (req, res) => {
    console.log(req.body);
    const userLogged = req.session.user;
    const randomShortURL = generateRandomString();
    if (!userLogged) {
        res.sendStatus(403);
    }
    if (!req.body.longURL) {
        res.sendStatus(400);
    }
    urlDatabase[userLogged.id][randomShortURL] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect(`/urls/${randomShortURL}`);
});

//update URL
app.post("/urls/:id", (req, res) => {
    const userLogged = req.session.user;
    if (!req.body.longURL) {
        res.sendStatus(404);
    }
    if (!userLogged) {
        res.sendStatus(403);
        return;
    }
    if (!creator(urlDatabase, userLogged, req.params.id)) {
        res.sendStatus(403);
        return;
    }
    urlDatabase[userLogged.id][req.params.id] = req.body.longURL;
    res.redirect(`/urls`);
});

//delete an individual URL
app.post("/urls/:id/delete", (req, res) => {
    const userLogged = req.session.user;
    if (!userLogged) {
        res.sendStatus(403);
        return;
    }
    delete(urlDatabase[userLogged.id][req.params.id]);
    res.redirect('/urls');
});

//registration
app.get("/register", (req, res) => {
    const userLogged = req.session.user;
    if (userLogged) {
        res.redirect('/urls');
    } else {
        res.render("urls_registration", { user: userLogged });
    }
});

//login
app.get("/login", (req, res) => {
    const userLogged = req.session.user;
    if (userLogged) {
        res.redirect('/urls');
    } else {
        res.render("urls_login", { user: userLogged });
    }
});

app.post("/register", (req, res) => {
    const { email, password } = req.body;
    for (let id in users) {
        if (email === users[id].email) {
            res.sendStatus(400);
            return;
        }
    }
    if (email && password) {
        const userId = generateRandomString();
        users[userId] = {
            id: userId,
            email: email,
            password: bcrypt.hashSync(password, 14)
        };
        urlDatabase[userId] = {};
        req.session.user = users[userId];
        console.log(req.session.user);
        res.redirect('/urls');
    } else {
        res.sendStatus(400);
        return;
    }
});

//the login
app.post("/login", (req, res) => {
    const user = userFinder(req.body.email);
    const hashed_password = bcrypt.hashSync(req.body.password, 10);
    const userpass = passwordFinder(req.body.password);
    if (!user) {
        return res.sendStatus(403)
    } else {
        if (!bcrypt.compareSync(req.body.password, hashed_password)) {
            return res.sendStatus(403)
        }
    }
    //if doesn't match pw of existing email -->403
    req.session.user = user.id;
    res.redirect('/urls');
    //if both pass set user_id cookie w/ matching user's random ID
})

//post logout, clear session cookie
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});