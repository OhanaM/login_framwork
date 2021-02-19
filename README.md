# Login Framework

### What it is
A basic login framwork written in NodeJs with SQLite3 as the db, ejs as frontend. It  allows two tier access (subscriber / guest).
https://github.com/OhanaM/login_framwork

### How to run this app
1. `npm install` to install dependencies
2. `./bin/dbmod reset` to reset the database if needed
3. `node routes/index.js` to start server

### Tech stack
Node.js, Express, Sqlite3

### Deployment
You can access this project at http://18.217.218.42:8000/
Be sure to access it with http
You can find the api at 
http://18.217.218.42:8000/api/subscriber/:userID or
http://18.217.218.42:8000/api/guest/:userID
For example:
http://18.217.218.42:8000/api/subscriber/1
http://18.217.218.42:8000/api/guest/2