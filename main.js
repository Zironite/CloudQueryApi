const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 55555;
const db = new sqlite3.Database("file.db", sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to db")
    }
});
app.get("/results", (req,res) => {
    db.serialize(() => {
        db.all(`SELECT * 
                FROM links 
                WHERE link LIKE '%${req.query.query}%' OR
                    title LIKE '%${req.query.query}%' OR
                    description LIKE '%${req.query.query}%' OR
                    gist LIKE '%${req.query.query}%' OR
                    screenshot_url LIKE '%${req.query.query}%'`, (err,rows) => {
            if (err) {
                console.log(err);
            }
            res.send({ results: rows });
        });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));