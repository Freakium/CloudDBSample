const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const app = express();
var output;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index', {dbContents:null});
});

app.post('/', upload.any(), (req, res) => {
    output = [];
    fs.writeFile('./databases/temp/' + req.files[0].originalname, req.files[0].buffer, (err) => {
        if (err) {
            console.log('Error: ', err);
            res.status(500).send('An error occurred: ' + err);
        } else {
            let db = new sqlite3.Database('./databases/temp/' + req.files[0].originalname, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Connected to the database.');
            });
            /*db.run(`ATTACH './databases/` + req.files[0].originalname + `' AS secondary;
                INSERT INTO Tool SELECT * FROM secondary.Tool;
                DETACH secondary;`);*/
            db.serialize(() => {
                db.each('SELECT * FROM Tool', (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }
                    output.push(row);
                });
            });
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
                else {
                    res.status(200).send(output);
                    console.log('Close the database connection.');
                }
            });
        }
    });
});

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
