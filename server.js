const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
var output = [];

app.set('view engine', 'ejs');

// open the database
let db = new sqlite3.Database('./databases/Evaluation_database_UNIT1.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
    console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.each(`SELECT * FROM CalibrationResult
        LIMIT 0,2`, (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(/*row.id + "\t" + row.name*/row);
        output.push(row);
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});

app.get('/', function(req, res) {
    res.render('index', {dbContents:output});
});

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
