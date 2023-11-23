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

const date = new Date();
var day = date.getDate();
var month = date.getMonth()+1;
var year = date.getFullYear();


//listen port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


//mongodb
const {MongoClient} = require('mongodb');
const dbUrl = 'mongodb+srv://ktk10566:ktk10566@cluster0.mgewehr.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(dbUrl);
//---mongbdb collections
const student = client.db('project').collection('students');
const contact = client.db('project').collection('contacts');
const attendance = client.db('project').collection('attendances');


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
		//find user
		await client.connect();
		var query = { userID : req.body.username }
		var result = await student.findOne(query);
		
		if (result != null) {
			//match password
			if (req.body.password == result.userPW) {
				//session
				req.session.authenticated = true;
				req.session.username = result.userID;
				console.log(`${req.session.username} Login Successful...`);
				req.session.attShow = null;
				res.redirect('/');
			} else {
				res.render('message',{message:'Wrong Password'});
			}
		} else {
			res.render('message',{message:'User Not Found'});
		}
	} finally {
		await client.close();
	}
});

//---logout
app.get('/logout', async (req, res) => {
	req.session = null;
	console.log('Logout...');
	res.render('message',{message:'Logout'});
});

//---main
app.get('/main', async (req, res) => {
	try {
		await client.connect();
		//seach for..
		var query = { userID : req.session.username };

		//..profile
		var profile = await student.findOne(query);

		//..emergency contacts
		var contacts = await contact.find(query).toArray();
		
		//..attendances
		var attendances = await attendance.find(query).toArray();
	} finally {
		await client.close();
		//cheack for today's attendance
		req.session.attendance = false;
		for (var att of attendances) {
			if ((day==att.day) && (month==att.month) && (year==att.year)) {
				req.session.attendance = true;
				break;
			} 
		}
		res.status(200).render('main',{
			profile : profile,
			contact : contacts,
			attendance : req.session.attendance,
			attShow : req.session.attShow
		});
	}
});

//---student profile  (UPDATE)
//------update phone
app.post('/newphone', async (req, res) => {
	try{
		await client.connect();
		//check if phone number is used
		var check = await student.findOne({ phone : req.body.phone });
		if (check != null) {
			res.render('message',{message:'Failed : Number Existed'});
		} else {
			var find = { userID : req.session.username };
			var set = { $set : { phone : req.body.phone } };
			//update
			await student.updateOne(find, set);
			res.render('message',{message:'Phone Updated'});
		}
	} finally {
		await client.close();
	}
});
//------update email
app.post('/newemail', async (req, res) => {
	try{
		await client.connect();
		//check if email is used
		var check = await student.findOne({ email : req.body.email });
		if (check != null) {
			res.render('message',{message:'Failed : Email Existed'});
		} else {
			var find = { userID : req.session.username };
			var set = { $set : { email : req.body.email } };
			//update
			await student.updateOne(find, set);
			res.render('message',{message:'Email Updated'});
		}
	} finally {
		await client.close();
	}
});

//---emergency contact (CREATE && DELETE)
//------create contact
app.post('/addcontact', async (req, res) => {
	try{
		await client.connect();
		//count contacts
		var query = { userID : req.session.username };
		var condition = await contact.find(query).toArray();
		
		//can only create contacts up to 5
		if (condition.length >= 5) {
			res.render('message',{message:'Failed : Reach Limit'});
		} else {
			//check if number already exist
			status = true;
			for(var object of condition) {
				if (object.phone == req.body.phone){
					status = false;
					res.render('message',{message:'Failed : Number Exist'});
					break;
				}
			}
			if (status){
				var doc = {
					userID : req.session.username,
					phone : req.body.phone,
					relation : req.body.relation
				};
				//create
				await contact.insertOne(doc);
				res.render('message',{message:'Contact Created'});
			}
		}
	} finally {
		await client.close();
	}
});
//------delete contact
app.post('/delcontact', async (req, res) => {
	try{
		await client.connect();
		//check if number exist
		var result = await contact.findOne({'userID':req.session.username, 'phone':req.body.phone});
		if (result != null) {
			//delete by phone number
			var query = { userID : req.session.username, phone : req.body.phone };
			await contact.deleteOne(query);
			res.render('message',{message:'Contact Deleted'});
		} else {
			res.render('message',{message:'Contact Not Exist'})
		}
	} finally {
		await client.close();
	}
});

//---attendance tracking (CREATE && READ)
//------create attendance
app.get('/attendance', async (req, res) => {
	try{
		await client.connect();
		if (req.session.attendance == false){	
			var doc = {
				userID : req.session.username,
				day : day,
				month : month,
				year : year
			};
			await attendance.insertOne(doc);
			res.render('message',{message:'Attendance Taken'});
		} else {
			res.render('message',{message:'Already Taken'});
		}
	} finally {
		await client.close();
	}
});
//------read attendance
//------can only search with current year
app.post('/attendance', async (req, res) => {
	try {
		await client.connect();
		var value = req.body.month;
		//read all
		if (value == ''){
			var query = { userID : req.session.username, year : year };
			var sort = {month:1, day:1};
			var result = await attendance.find(query).sort(sort).toArray();
		}
		//read specific month
		else {
			var query = { userID : req.session.username, year: year, month : parseInt(value) };
			var sort = {day:1};
			var result = await attendance.find(query).sort(sort).toArray();
		}
	} finally {
		await client.close();
		req.session.attShow = result;
		res.redirect('/');
	}
});


//RESTful API
//---POST(create new contact)
app.post('/:userid/contact', async (req, res) => {
	var phone = req.body.phone;
	var relation = req.body.relation;
	//check data
	if (((phone!=null)&&(relation!=null))) {
		if (phone.length==8){
			try {
				var userid = req.params.userid;
				await client.connect();
				//check if student exist
				var find = await student.findOne({'userID':userid})
				if (find != null) {
					//check if no. of contact > 5
					var check = await contact.find({'userID':userid}).toArray();
					if (check.length >= 5) {
						res.status(200).write('Reach Limit...');
						res.end();
					} else {
						//check if number exist
						var result = await contact.findOne({'userID':userid,'phone':phone});
						if (result == null) {
							//start creating
							var doc = {
								'userID' : userid,
								'phone' : phone,
								'relation' : relation
							};
							await contact.insertOne(doc);
							var value = {'updated' : true};
							res.status(200).json(value);
						} else {
							res.status(200).write('Number Existed...');
							res.end();
						}
					}
				} else {
					res.status(200).write('Student Not Found...');
					res.end();
				}
			} finally {
				await client.close();
			}
		} else {
			res.status(200).write('Phone Number Length Should Be 8 Digit...');
			res.end();
		}

	} else {
		res.status(200).write('Data Is Not Valid...');
		res.end();
	}
});
//---GET(show student name)
app.get('/:userid/profile', async (req, res) => {
	try {
		await client.connect();
		var userid = req.params.userid;
		//check if student exist
		var result = await student.findOne({'userID':userid});
		if (result != null) {
			var value = {
				'First Name' : result.fName,
				'Last Name' : result.lName
			};
			res.status(200).json(value);
		} else {
			res.status(200).write('Student Not Found...')
			res.end();
		}
	} finally {
		await client.close();
	}
});
//---PUT(update studne phone)
app.put('/:userid/phone', async (req, res) => {
	//check data
	var userid = req.params.userid;
	var phone = req.body.phone;
	if ((userid!=null)&&(phone!=null)) {
		try {
			await client.connect();
			//check if studnet exist
			var result = await student.findOne({'userID':userid});
			if (result != null) {
				await student.updateOne({'userID':userid},{'$set':{'phone':phone}});
				var result = await student.findOne({'userID':userid});
				var value = {
					'ID' : result.userID,
					'New Phone' : result.phone
				}
				res.status(200).json(value);
			} else {
				res.status(200).write('Student Not Found...')
				res.end();
			}
		} finally {
			await client.close();
		}
	} else {
		res.status(200).write('Data Is Not Valid...')
		res.end();
	}
});
//---DELETE(delete contact)
app.delete('/:userid/contact/:phone', async (req, res) => {
	var userid = req.params.userid;
	var phone = req.params.phone;
	var query = {'userID':userid, 'phone':phone}
	try {
		await client.connect();
		var result = await contact.findOne(query);
		if (result != null) {
			await contact.deleteOne(query);
			res.status(200).write('Deleted...');
			res.end();
		} else {
			res.status(200).write('No Data Match...');
			res.end();
		}
	} finally {
		await client.close();
	}
});
