//setup
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const session = require('cookie-session');
app.use(session({
	name : 'login-session',
	keys : ['login passport']
}));


//mongodb
const {MongoClient} = require('mongodb');
const dbUrl = 'mongodb+srv://ktk10566:ktk10566@cluster0.mgewehr.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(dbUrl);


//routes
//---default route
app.get('/', (req, res) => {
	if (req.session.authenticated == true) {
		res.redirect('/main');
	} else {
		res.redirect('/login');
	}
});

//---login
app.get('/login', (req, res) => {
	res.status(200).render('login',{});
});

app.post('/login', async(req, res) => {
	try{
		await client.connect();
		console.log('Connected to database...');
		
		var query = { userID : req.body.username };
		
		//find user
		var result = await client.db('project').collection('students').findOne(query);
		if (result != null) {
			console.log('User found...');
			
			//match password
			if (result.userPW == req.body.password) {
				console.log('Login successful...');
				req.session.authenticated = true;
				req.session.username = result.fName + ' ' + result.lName;
			} else {
				console.log('Wrong password...');
			}
		} else {
			console.log('User not found...');
		}
	} finally {
		await client.close();
		console.log('Disconnect from database...')
		res.redirect('/');
	}
});

//---logout
app.get('/logout', (req, res) => {
	req.session = null;
	console.log('Logout...')
	res.redirect('/');
});

//---main
app.get('/main', (req, res) => {
	res.status(200).render('main',{});
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
