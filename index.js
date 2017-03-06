const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const local = require('./local.js');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: local.host,
    user: local.user,
    password: local.password,
    database: local.database
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/cities', function(req, res) {
    var start = req.query.start;
    var end = req.query.end;
    pool.query('SELECT \
        cities.cityId,\
        cities.name AS city, \
        states.name AS state \
        FROM cities \
        JOIN states ON states.stateId = cities.stateId \
        WHERE cities.cityId >= ' + start + ' AND cities.cityId <= ' + end,
        function(error, results, fields) {
            if (error) console.error(error);
            res.json(results);
        });
});

app.post('/cities', function(req, res) {
    var data = JSON.parse(req.body.data);
    pool.query('INSERT INTO newcities \
        (cityId,city_en,city_hi,state_en,state_hi,lat,lng) VALUES ?', [data],
        function(error, results, fields) {
            if (error) {
                console.error(error);
                return res.send('error');
            }
            res.send('success');
        });
});

app.listen(3000, function() {
    console.log("Server started at http://localhost:3000");
});
