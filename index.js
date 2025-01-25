require("dotenv").config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require("express-session");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//configuration of session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.get("/", (req, res) =>
{
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/lab", (req, res) =>
{
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/temp", (req, res) =>
{
    res.sendFile(path.join(__dirname, "views", "temp.html"));
})

app.listen(3000, () =>
{
    console.log("listening on port 3000");

});