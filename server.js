const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('pages/index', {dbContents:null});
});
app.get('/queries', function(req, res) {
    res.render('pages/queries');
});

// Integration post route
app.post('/', upload.any(), (req, res) => {
    fs.writeFile('./databases/temp/' + req.files[0].originalname, req.files[0].buffer, (err) => {
        if (err) {
            res.status(500).send('An error occurred: ' + err);
            console.error('Error: ', err);
        }
        else {
            let db = new sqlite3.Database('./databases/primary.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    res.status(500).send(err);
                    console.error(err);
                }
                console.log('Connected to the database.');
            });
            let secondary = new sqlite3.Database('./databases/temp/' + req.files[0].originalname, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    res.status(500).send(err);
                    console.error(err);
                }
                console.log('Connected to the secondary database.');
            });
            
            // Get all tables from uploaded DB and integrate
            secondary.each(`SELECT name FROM sqlite_master WHERE type='table'`, (error, tableRow) => {
                if (error) {
                    res.status(500).send(error);
                    console.error(error);
                }
                Object.keys(tableRow).forEach((table) => {
                    secondary.each('SELECT * FROM ' + tableRow[table], (err, row) => {
                        if (err) {
                            res.status(500).send(err);
                            console.error(err);
                        }
                        // Collects column names
                        const keys = Object.keys(row);
                        const columns = keys.toString();
                        let values = '';
                
                        // Collects values
                        Object.keys(row).forEach((r) => {
                            values += ",'" + row[r] + "'";
                        });
                        values = values.substr(1);
        
                        db.run('INSERT OR IGNORE INTO '+ tableRow[table] +' ('+columns+') VALUES ('+values+')');
                    });
                });
            });
            
            // close the database connections and delete secondary db file
            secondary.close((err) => {
                if (err) {
                    res.status(500).send(err);
                    console.error(err);
                }
                console.log('Closed the secondary database connection.');

                // delete temporary 2nd db
                fs.unlink('./databases/temp/' + req.files[0].originalname, function (err) {
                    if (err) {
                        res.status(500).send(err);
                        console.error(err);
                    }
                    console.log(req.files[0].originalname + ' deleted!');
                });
                db.close((err) => {
                    if (err) {
                        res.status(500).send(err);
                        console.error(err);
                    }
                    else {
                        res.status(200).send('ok');
                        console.log('Closed the primary database connection.');
                    }
                });
            });
        }
    });
});

app.post('/queries', (req, res) => {
    console.log(req.body.query);
    // test if query begins with SELECT statement
    var queryTest = req.body.query.split(' ');
    if(queryTest[0].toUpperCase() != 'SELECT'.toUpperCase()) {
        res.status(500).send('Please query database with a SELECT statement.');
    }
    else {
        var output = [];
        let db = new sqlite3.Database('./databases/primary.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                res.status(500).send(err);
                console.error(err);
            }
            console.log('Connected to the database.');
        });
        db.each(req.body.query, (err, row) => {
            if (err) {
                res.status(500).send(err);
                console.error(err);
            }
            output.push(row);
        }).close((err) => {
            if (err) {
                res.status(500).send(err);
                console.error(err);
            }
            else {
                res.status(200).send(output);
                console.log('Closed the primary database connection.');
            }
        });
    }
});

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
