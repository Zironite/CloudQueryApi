const express = require("express");
const mysql = require('mysql');
var cors = require('cors');

const app = express();
app.use(cors());
const port = 55555;
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    app.get("/results", (req, res) => {
        if (err) throw err;

        connection.query(`SELECT * 
                        FROM TWITTER_LINKS 
                        WHERE LINK LIKE '%${req.query.query}%' OR
                            TITLE LIKE '%${req.query.query}%' OR
                            DESCRIPTION LIKE '%${req.query.query}%' OR
                            CONTENT LIKE '%${req.query.query}%' OR
                            SCREENSHOT_URL LIKE '%${req.query.query}%'
                        LIMIT 1000`, (err, result) => {
            if (err) throw err;
            const transformedResults = result.map(row => {
                return {
                    link: row.LINK,
                    title: row.TITLE,
                    description: row.DESCRIPTION,
                    gist: row.CONTENT,
                    screenshot_url: row.SCREENSHOT_URL,
                    timestamp: row.CURR_DATE
                };
            });
            res.send({
                results: transformedResults
            });
        });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));