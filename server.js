//setup
const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const session = require('cookie-session');

app.set('view engine', 'ejs');

//set mongodb
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb+srv://ktk10566:ktk10566@cluster0.mgewehr.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'test';

const client = new MongoClient(dbUrl);

client.connect(err => {
	ssert.equal(null,err);
	console.log('Connected to database');
	const db = client.db(dbName);
	client.close();
});



//routes
//default route
app.get('/', (req, res) => {
	res.status(200).redirect('/login');
});

//login
app.get('/login', (req, res) => {
	res.render('login',{});
});

app.post('/login', (req, res) => {
	var userInput = req.body.username;
	var pwInput = req.body.password;
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
