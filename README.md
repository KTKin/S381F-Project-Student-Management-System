# Project - Student Record System
## Introduction
- The system provides http CRUD services and RESTful services.
- Mongodb is used as database.
## Getting Start
- URL : "https://srs-wjsz.onrender.com/"
- Testing account1 -> Username: `s123456` & Password: `123456`
- Testing account2 -> Username: `s456789` & Password: `456789`
## Testing Login/Logout
### Normal Flows - Login
1. Open the URL above to enter login page.
2. Select one account above for login.
3. If both `Username` and `Password` are correct, browser will jump to `/main` route instantly.
### Exceptions
- Any exception below that causes login failure: 
1. The `Username` is not in the database.
2. The `Password` does not match `Username` in the database.
### Successful Login
- Once login is successful, session will be create and record the `authenticated status` and `Username`.
```
req.session.authenticated : true,
req.session.username : <Username>
```
- while the session exist, users can skip the login page to ascess `/main`. 
- the session will stay until user logout.

### Normal Flows - Logout
1. Press the "Logout" button on the bottom of main page
   OR
2. Type the URL with route `/logout`
### Successful Logout
- Once Logout is successful, session will be set as `null`
- Login process is required to asscess main page after Logout
