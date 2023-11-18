const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const app = express();
const port = 3000;

// MongoDB setup (replace with your actual connection details)
const MongoClient = mongodb.MongoClient;
const dbUrl = 'your_mongodb_url';
const dbName = 'your_db_name';
let db;

MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;
    db = client.db(dbName);
    console.log('Connected to database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('crud');
});

// Handle viewing student profiles
app.post('/viewStudent', (req, res) => {
    const studentId = req.body.studentId;
    // Replace with actual database query
    db.collection('students').findOne({ student_id: studentId }, (err, student) => {
        if (err) {
            res.send('Error fetching student data');
        } else {
            res.send(`Student Profile: ${JSON.stringify(student)}`);
        }
    });
});

// Handle recording grades
app.post('/recordGrades', (req, res) => {
    // Example data, replace with actual request data
    const studentId = 'some_id';
    const grades = { math: 90, science: 85 };

    // Replace with actual database update
    db.collection('students').updateOne({ student_id: studentId }, { $set: { grades: grades } }, (err, result) => {
        if (err) {
            res.send('Error recording grades');
        } else {
            res.send(`Grades Recorded for Student ID: ${studentId}`);
        }
    });
});

// Handle viewing transcripts
app.post('/viewTranscript', (req, res) => {
    const studentId = req.body.studentIdForTranscript;

    // Replace with actual database query
    db.collection('students').findOne({ student_id: studentId }, (err, student) => {
        if (err) {
            res.send('Error fetching transcript');
        } else {
            res.send(`Transcript for Student ID: ${studentId} - Grades: ${JSON.stringify(student.grades)}`);
        }
    });
});

// Handle course management
app.post('/manageCourse', (req, res) => {
    const courseName = req.body.courseName;
    // Logic for adding/updating a course
    // Example: db.collection('courses').updateOne(...)
    res.send(`Course Managed: ${courseName}`);
});

// Handle attendance recording
app.post('/recordAttendance', (req, res) => {
    const classId = req.body.classId;
    const studentId = req.body.studentId;
    const attendanceStatus = req.body.attendanceStatus;

    // Logic for recording attendance
    // Example: db.collection('attendanceRecords').insertOne(...)
    res.send(`Attendance Recorded: Class ID - ${classId}, Student ID - ${studentId}, Status - ${attendanceStatus}`);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
