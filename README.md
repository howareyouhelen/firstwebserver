# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit. ly).

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Navigation 

- / (root page) Getting started, please register an account with TinyApp to login, otherwise, login to continue.
- redirection will occur once a user is logged in or registered, user will be redirected to /urls page, where they can see all their short and long URLs.
  - users are given with options to either update or delete their existing URL
  - users also have a choice to "make a new URL"
  - users can logout
- once user clicks on the Edit link of a particular URL they wish to update, they will be redirected to the page  of that particular URL and once the user enters a new long url and clicks update, the long url of that particular short url will get updated to the newest one the user inputed.
- user can always click on the "Your Index" link on the bottom of the page to go back to their index page
- when user created their url or clicked on the "Edit" link of an url, they will be taken the update page. If user wish to go to the specific long url that links to that short url, simply change the "urls" to "u" in the address bar
  - For example: "localhost:8080/urls/NuW4j3"
  - if user wish to head to this short url's actual website...change it to...
  - "localhost:8080/u/NuW4j3
  - then, automatically, user will be redirected to the acutal webpage
