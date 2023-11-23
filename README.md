# Project - Student Record System
## Getting Start
- URL : "https://srs-qiyp.onrender.com"
- Testing account1 -> Username: `s123456` & Password: `123456`
- Testing account2 -> Username: `s456789` & Password: `456789`

## Login/Logout
### Testing Login
#### Normal Flows - Login
1. Open the URL above to enter login page.
2. Select one account above for login.
3. If both `Username` and `Password` are correct, browser will jump to `/main` route instantly.
#### Exceptions
- Any exception below that causes login failure: 
1. The `Username` is not in the database.
2. The `Password` does not match `Username` in the database.
#### Successful Login
- Once login is successful, session will be create and record the `authenticated status` and `Username`.
```
req.session.authenticated : true,
req.session.username : <Username>
```
- while the session exist, users can skip the login page to ascess `/main`. 
- the session will stay until user logout.
### Testing Logout
#### Normal Flows - Logout
1. Press the "Logout" button on the bottom of main page.
<br/>OR
2. Type the URL with route `/logout`.
#### Successful Logout
- Once Logout is successful, session will be set as `null`.
- Login process is required to asscess main page after Logout.

## CRUD services
### Student Profile (UPDATE)
- There are two data can be update in this section: `Phone` AND `Email`.
- `Phone` with constraint of 8 digit number.
- `Email` is a String.
#### Normal Flows
1. Type the data in the input area.
2. Press `Update` to update the phone number.
#### Exceptions
- Any exception below that causes update failure:
1. Phone number is not 8 digit number.
2. Phone number or email is used by other user.
#### Successful Update
- New data will replace old data and be show in the main page.

### Emergency Contact (CREATE & DELETE)
- Create emergency contact by entering `Phone` and `Relation`
- Maximum number of contact is 5
- `Phone` with constraint of 8 digit number.
- `Relation` is a String.
#### Normal Flows (CREATE)
1. Type the phone and relation inthe input area
2. Press "Add"
#### Exceptions
- Any exception below that causes update failure:
1. Number of contact reaches 5
2. Phone number is not 8 digit number.
3. Phone number already exist in user contact table.
#### Successful Update
- New contact append to the contact table and show on main page.

### Attendance (CREATE & READ)
#### Normal Flows
#### Exceptions
#### Successful Update
## RESTful services

