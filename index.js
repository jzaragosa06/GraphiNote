const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) =>
{
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.listen(3000, () =>
{
    console.log("listening on port 3000");

})