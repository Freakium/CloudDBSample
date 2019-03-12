const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const app = express();
var output = [];

app.use(express.static('public'));
app.set('view engine', 'ejs');

// open the database
let db = new sqlite3.Database('./databases/Evaluation_database_UNIT1.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
    console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.each('SELECT * FROM CalibrationResult LIMIT 0,5', (err, row) => {
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

app.post('/post_db/', upload.any(), (req, res) => {
    console.log('POST /post_db/');
    console.log('Files: ', req.files);
    fs.writeFile(req.files[0].originalname, req.files[0].buffer, (err) => {
        if (err) {
            console.log('Error: ', err);
            res.status(500).send('An error occurred: ' + err.message);
        } else {
            res.status(200).send('ok');
        }
    });
});

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
