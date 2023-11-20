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
		
		var query = { userID : req.body.username };
		
		//find user
		var result = await client.db('project').collection('students').findOne(query);
		if (result != null) {
			console.log('User found...');
			
			//match password
			if (result.userPW == req.body.password) {
				console.log('Login successful...');
				req.session.authenticated = true;
				req.session.username = req.body.username;
			} else {
				console.log('Wrong password...');
			}
		} else {
			console.log('User not found...');
		}
	} finally {
		await client.close();
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
app.get('/main', async (req, res) => {
	try {
		//seach for data
		await client.connect();
		var query = { userID : req.session.username };
		var result = await client.db('project').collection('students').findOne(query);
		
		//data for displaying profile
		var profile = {
			fName : result.fName,
			lName : result.lName,
			birthDay : result.birthDay,
			phone : result.phone,
			email : result.email
		};
		
		//data for displaying emergency contact
		var emergContact = result.emergContact;

	} finally {
		await client.close();
	}
	res.status(200).render('main',{
		profile : profile,
		contact : emergContact
	});
});

//---student profile
app.get('/main/profile', (req, res) => {
	res.status(200).render('profile');
});

app.post('/main/profile',(req, res) => {

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
