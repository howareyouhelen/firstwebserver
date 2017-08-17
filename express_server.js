const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const PORT = process.env.PORT || 1234; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
    name: 'session',
    secret: 'minion',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

var urlDatabase = {
    "userRandomID": {
        "h6fKIO": "http://www.google.com",
        "Kh38Hv": "http://www.tweeter.com",
        "PKA12n": "http://www.reddit.com"
    },
    "2": {
        "iO9awN": "http://www.youtube.com",
        "G7Hnas": "http://www.facebook.com",
        "Ni82Hn": "http://www.lighthouselabs.ca"
    }
};

var users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: bcrypt.hashSync("123456", 10)
    },
    "2": {
        id: "2",
        email: "user2@example.com",
        password: bcrypt.hashSync("234567", 10)
    },

    "1": {
        id: "1",
        email: "user3@example.com",
        password: bcrypt.hashSync("345678", 10)
    }
}

//below is implementing the func generateRandomString()
function generateRandomString() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) {
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
        // res.render("urls_not_found");
        res.sendStatus(400);
    } else {
    const templateVars = {
        urls: urlDatabase[userLogged.id],
        user: users[userLogged.id]
    };
    res.render("urls_index", templateVars);
    }
});

//get new url insert
app.get("/urls/new", (req, res) => {
    const userLogged = req.session.user;
    if (!userLogged) {
        res.redirect('/login');
    }
    const templateVars = {
        // urls: urlDatabase[userLogged.id],
        user: userLogged
    };
    res.render("urls_new", templateVars);
});

//get to longurl site 
app.get("/u/:shortURL", (req, res) => {
    const userLogged = req.session.user;
    let short = req.params.shortURL;

    let longURL = urlDatabase[userLogged.id][short];

    if (longURL) {
        res.redirect(longURL);
    } else {
        res.status(404).send('Sorry, we cannot find that!');
    }
});

//get shorturl's summary
app.get("/urls/:id", (req, res) => {

    const userLogged = req.session.user;
    // if (!userLogged) {
    //     res.sendStatus(403);
    // }
    // if (!urlDatabase[userLogged][req.params.id]) {
    //     res.sendStatus(404);
    // }
    // if (!creator(urlDatabase, userLogged, req.params.id)) {
    //     res.sendStatus(403);
    // }
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[userLogged.id][req.params.id],
        user: users[userLogged.id]
    };
    console.log(templateVars);
    res.render("urls_show", templateVars);
});

//new URL
app.post("/urls", (req, res) => {
    const userLogged = req.session.user;
    const userID = userLogged.id;
    console.log("user info:", userLogged.id);
    if (userLogged) {
        if(!urlDatabase[userID]) {
            urlDatabase[userID] = {};
        }
        let longURL = req.body.longURL;
        let randomShortURL = generateRandomString();
        urlDatabase[userID][randomShortURL] = longURL;
        res.redirect(`/urls/${randomShortURL}`);
    } else {
        res.status(400).send("You cant post if you arent logged in");
    }
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
        res.sendStatus(401);
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

//post login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    for (let id in users) {
        if (email === users[id].email) {
            if (bcrypt.compareSync(password, users[id].password)) {
                req.session.user = users[id];
                res.redirect('/urls');
                return;
            }
        }
    }
    res.sendStatus(401);
});

//post logout, clear session cookie
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect('/');
});

//registration
app.post("/register", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    const hashed_password = bcrypt.hashSync(password, 10);
    if (!email || !password) {
        res.status(400).send("Can't be blank");
    }
    for (user in users) {
        if (email === users[user].email) {
            res.status(400).send("Email already in use");
        }
    }
    let randomShortURL = generateRandomString();
    users[randomShortURL] = {
        id: randomShortURL,
        email: email,
        password: hashed_password
    };
    req.session.user = users[randomShortURL];
    res.redirect("/urls");
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});