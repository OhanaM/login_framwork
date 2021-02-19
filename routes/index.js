// Utils
const express = require('express')
const path = require('path');
const app = module.exports = express();
const session = require('express-session');
const cookieSession = require('cookie-session');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const port = 8000
const saltRounds = 10;

app.listen(port, () => {
  console.log(`Login_framwork listening at http://localhost:${port}`)
})

app.use(express.urlencoded({ extended: false }))

app.use(express.static("premium_content"));

// Middleware
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge:  3600 * 1000 // 1hr
}));

const ifLoggedin = (req, res, next) => {
    if(req.session.isLoggedIn){
        return res.redirect('/main');
    }
    next();
}

const ifNotLoggedin = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.render('welcome');
    }
    next();
}

// Setting ejs as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Connecting to database
let db = new sqlite3.Database('./db/login_sys.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to database.');
});

// Setting primary routes
app.get('/', ifNotLoggedin, (req,res,next) => {
    res.render('welcome');
    
});

app.get('/login', ifLoggedin, (req, res) => {
  if (req.session.isLoggedIn == true) {
  	res.redirect('/main')
  } else {
	res.render('login', {error:""})
  }
})

app.get('/register', ifLoggedin, (req, res) => {
  if (req.session.isLoggedIn == true) {
  	res.redirect('/main')
  } else {
	res.render('register', {error: ""})
  }
})

app.get('/main', (req, res) => {
  if (req.session.isLoggedIn == true) {
  	console.log(req.session.userID);
  	db.get(`SELECT * FROM users WHERE uid=?`, req.session.userID, (err, row) => {
  		if (row) {
  			res.render('main', {name: row.first_name + ' ' + row.last_name, tier: row.tier})
  		}
  	})
  } else {
	res.redirect('/')
  }
})


// For login requests from '/login'
app.post('/login', ifLoggedin, (req, res, next) => {
    console.log(req.body.email);
    db.get(`SELECT * FROM users WHERE email=?`, [req.body.email], (err, row) => {
    	// console.log(row)
    	if (row) {
    		bcrypt.compare(req.body.password, row.password).then(compare => {
    			if(compare == true) {
    				req.session.isLoggedIn = true;
            req.session.userID = row.uid;
            let user_name = row.first_name + ' ' + row.last_name
            let tier = row.tier;
            res.render('main', {name: user_name, tier:tier})
    			} else {
    				res.render('login', {error: "invalid password"})
    			}
    		})
    	} else {
    		res.render('login', {error: "invalid email"})
    	}
    });
});

// For register requests from '/register'
app.post('/register', body('email', 'invalid email').isEmail(), (req, res, next) => {
	const validation_result = validationResult(req);
	if (validation_result.isEmpty()) {
		db.get(`SELECT email FROM users WHERE email=?`, [req.body.email], (err, row) => {
			if (err) {
	        	console.log(err.message)
	        }
	        if (row){
				res.render('register', {error: "Sorry, the email you entered either it already exists. You can try to login."})
			} else {
				bcrypt.hash(req.body.password, saltRounds).then((hash) => {
	            // Insertion into db
	        let sql = `INSERT INTO users (first_name, last_name, email, password, tier) VALUES (?, ?, ?, ?, ?)`;
	        let subs_info = [req.body.first_name, req.body.last_name, req.body.email, hash, 'guest'];
	        db.run(sql,subs_info, (err, result) => {
	          if (err){
	          console.log(err);
	          }
	          res.render('register_success');
	        })
	      })
	      .catch(err => {
	        if (err) throw err;
	      })
			}

		})
	} else {
		res.render('register', {error: "Sorry, the email you entered either is not a valid email."})
	}
})

app.post('/subscribe', (req, res) => {
	db.run('UPDATE users SET tier="subscriber" WHERE uid=?', req.session.userID, function(err) {
		if (err) {
			console.log(err.message)
		}
		console.log("asfasdf")
		res.redirect('/main');
	})
})

app.post('/unsubscribe', (req, res) => {
	db.run('UPDATE users SET tier="guest" WHERE uid=?', req.session.userID, function(err) {
		if (err) {
			console.log(err.message)
		}
		console.log("asfasdf")
		res.redirect('/main');
	})
})

// For API
app.get('/api/guest/:userId', (req, res) => {
    db.get('SELECT * FROM users WHERE tier="guest" AND uid=?', req.params.userId, (err, result) => {
    	if (err) console.log(err.message);
    	if (result) {
    		res.status(200).send(result);
    	} else {
    		res.status(200).send({});
    	}
    })
});

app.get('/api/subscriber/:userId', (req, res) => {
    db.get('SELECT * FROM users WHERE tier="subscriber" AND uid=?', req.params.userId, (err, result) => {
    	if (err) console.log(err.message);
    	if (result) {
    		res.status(200).send(result);
    	} else {
    		res.status(200).send({});
    	}
    })
});

