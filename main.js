const express = require("express");
const mysql = require('mysql');
var cors = require('cors');
const aws = require('aws-sdk');

const cloudWatch = new aws.CloudWatch();
const app = express();
app.use(cors());
const port = Number(process.env.APP_PORT);
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
        const start = process.hrtime();

        let valueToSearch = '';
        if (req.query.query) {
            valueToSearch = req.query.query;
        }

        connection.query(`SELECT * 
                        FROM TWITTER_LINKS 
                        WHERE LINK LIKE '%${valueToSearch}%' OR
                            TITLE LIKE '%${valueToSearch}%' OR
                            DESCRIPTION LIKE '%${valueToSearch}%' OR
                            CONTENT LIKE '%${valueToSearch}%' OR
                            SCREENSHOT_URL LIKE '%${valueToSearch}%'
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
            const end = process.hrtime();
            const totalTimeMs = (end[0]*1000 + end[1]/1000000) - (start[0]*1000 + start[1]/1000000);
            const params = {
                MetricData: [
                  {
                    MetricName: 'QUERY_TIME_TAKEN_MS',
                    Unit: 'Milliseconds',
                    Value: totalTimeMs
                  }
                ],
                Namespace: 'SITE/PROCESSED_URLS' /* required */
              };
            cloudWatch.putMetricData(params, (err,data) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Successfully inserted to CloudWatch');
                }
            });
            res.send({
                results: transformedResults
            });
        });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));