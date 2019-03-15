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

// closes the specified database connection
var closeDatabaseConnection = (dbCon) => {
    dbCon.close((err) => {
        if (err) {
            console.error(err);
        }
    });
}

// deletes the specified file
var deleteFile = (filename) => {
    fs.unlink(filename, (err) => {
        if (err) {
            console.error(err);
            deleteFile(filename);
        }
    });
}

// Integration page post route
app.post('/', upload.any(), (req, res) => {
    var filepath = './databases/temp/' + req.files[0].originalname;
    fs.writeFile(filepath, req.files[0].buffer, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        
        // connect to DBs
        let dbCon1 = new sqlite3.Database('./databases/Primary.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                res.status(500).send(err.message);
                console.error(err);
            }
        });
        let dbCon2 = new sqlite3.Database(filepath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                res.status(500).send(err.message);
                console.error(err);
            }
        });
    
        // Get all tables from uploaded DB and integrate
        dbCon2.all(`SELECT name FROM sqlite_master WHERE type='table'`, (error, tableRow) => {
            if (error) {
                res.status(500).send(error.message);
                console.error(error);

                // safely close DB connections and delete temporary file
                closeDatabaseConnection(dbCon1);
                closeDatabaseConnection(dbCon2);
                deleteFile(filepath);
            }
            else {
                // Collect table names
                tableRow.forEach((table) => {
                    dbCon2.all('SELECT * FROM ' + table.name, (err, rows) => {
                        if (err) {
                            res.status(500).send(err.message);
                            console.error(err);
                            return;
                        }

                        if(rows != null) {
                            rows.forEach( (row) => {
                                // Collects column names
                                const keys = Object.keys(row);
                                const columns = keys.toString();
                                let values = '';
                        
                                // Collects values
                                Object.keys(row).forEach((r) => {
                                    values += ",'" + row[r] + "'";
                                });
                                values = values.substr(1);

                                dbCon1.run('INSERT OR IGNORE INTO '+ table.name +' ('+columns+') VALUES ('+values+')');
                            });
                        }
                    });
                });
                
                // close the database connections and delete secondary db file
                dbCon2.close((err) => {
                    if (err) {
                        console.error("Con2 close", err);
                        res.status(500).send(err.message);
                        console.error(err);
                    }
                    dbCon1.close((err) => {
                        if (err) {
                            console.error("CON 1 Close", err);
                            res.status(500).send(err.message);
                            console.error(err);
                        }
                        else {
                            res.status(200).send('ok');
                            deleteFile(filepath);
                        }
                    });
                });
            }
        });
    });
});

// Queries page post route
app.post('/queries', (req, res) => {
    // test if query begins with SELECT statement
    var query = req.body.query.trim();
    var queryTest = query.split(' ');
    if(queryTest[0].toUpperCase() != 'SELECT'.toUpperCase()) {
        res.status(500).send('Please query database with a SELECT statement.');
    }
    else {
        var output = [];
        var goodQuery = true;
        let db = new sqlite3.Database('./databases/primary.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                res.status(500).send(err.message);
                console.error(err);
            }
        });
        // Grab contents of all rows from query and send to client
        db.each(query, (err, row) => {
            if (err) {
                goodQuery = false;
                res.status(500).send(err.message);
                console.error("BAD QUERY" + err);
                closeDatabaseConnection(db);
            }
            else {
                output.push(row);
            }
        });

        db.close((err) => {
            if (err) {
                res.status(500).send(err.message);
                console.error(err);
            }
            if(goodQuery) {
                res.status(200).send(output);
            }
        });
    }
});

app.listen(8080, function() {
    console.log('Now listening on port 8080.');
});
