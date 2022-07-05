import express, { response } from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';
import handleTimePeriod from './controllers/TNCAS/timePeriods.mjs';
import news from './controllers/BCN/news.mjs'
// import cookieParser from 'cookie-parser';
import knex from 'knex';
import session from 'express-session';
import knexSessionStore from 'connect-session-knex';
import bcrypt from 'bcryptjs';



const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const knexSession = knexSessionStore(session);

const postgres = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'test',
    database : 'nft-daily'
  }
});

const store = new knexSession({
  knex: postgres,
  tablename: 'sessions'
})

app.use(session({
  store: store,
  secret: 'some secret',
  resave: false,
  cookie: { secure: true,
            maxAge: 10000},
  saveUninitialized: false,
}))
// app.use(cookieParser());

// const isAuth = () => {
//   if (req.session.authenticated) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// }


const urlTNCAS = 'https://top-nft-collections-and-sales.p.rapidapi.com/collections/30d';
const urlBCN = 'https://blockchain-news1.p.rapidapi.com/news';

const optionsTNCAS = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '837dc6b60amsh7c39ed5f163c497p15734ejsn48d377555198',
      'X-RapidAPI-Host': 'top-nft-collections-and-sales.p.rapidapi.com'
    }
  };

const optionsBCN = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '837dc6b60amsh7c39ed5f163c497p15734ejsn48d377555198',
    'X-RapidAPI-Host': 'blockchain-news1.p.rapidapi.com'
  }
};

app.post('/register', (req, res) => {
  const {username, email, password} = req.body;
  if (!(username && email && password)) {return res.status(400).json('fill')}
  return postgres('users').where('email', email)
  .then(response => {
    if (response[0]) return res.status(400).json('duplicate') 
    else {
      const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))  
      return postgres.transaction(function(trx) {
        return postgres('login').transacting(trx).insert({
          email: email,
          hash: hash
        })
          .then(function(resp) {
            return postgres('users').transacting(trx).insert({
              username: username,
              email: email,
              joined: new Date()
            })
            .then(dbresponse => dbresponse)
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
      .then(function(resp) {
        return postgres('users').where('email', email)
        .then(user => res.status(200).json(user[0]))
        .catch(err => res.status(400).json('error finding'))
      })
      .catch(function(err) {
        return res.status(400).json('failure')
      });
    }
  }) 
});  
  

app.post('/login', (req, res) => {
  // req.session.authenticated = true;
  const { email, password } = req.body;
  if (!(email && password)) return res.status(400).json('fill');
  postgres('login').where('email', email)
  .then(response => {
    if(bcrypt.compareSync(password, response[0].hash)) {
      postgres('users').where('email', email)
      .then(user => {
        return res.status(200).json(user[0]);
      })
      .catch(err => res.status(400).json('failure'));      
    } else {
      return res.status(400).json('failure');
    }
  })
  .catch(err => res.status(400).json('failure'))
})




// app.post('/login', (req, res) => {
//   console.log("auth: ", req.session.authenticated)
//   console.log(req.sessionID);
//   const { username, password } = req.body;
//   if (username && password) {
//     if (req.session.authenticated) {
//       res.json(req.session);
//     } else {
//       if (password === '123') {
//         req.session.authenticated = true;
//         req.session.user = {
//           username, password
//         };
//         res.json(req.session);
//       } else {
//         res.status(403).json({msg: 'bad credentials'})
//       }
//     }
//   } else {
//     res.status(403).json({msg: 'bad credentials'})
//   }
// })
  
// NEWS end-points
app.get('/NDTV', (req, res) => {news.specificNews(req, res, fs)})
app.get('/news', (req, res) => {news.allNews(req, res, fs)})

// CHARTS end-point
app.get('/:time', (req, res) => handleTimePeriod(req, res, fs));


app.get('/', (req, res) => {
  req.session.authenticated = true;
  res.json("you made it it");
})


app.listen(3000);
















// const validateCookie = (req, res, next) => {
//   const { cookies } = req;
//   if ('session_id' in cookies) {
//     console.log('session id exists.');
//     if (cookies.session_id === '123456') {
//       next();
//     } else {
//       res.status(403).send({msg: 'not authenticated'});
//     }
//   } else {
//     res.status(403).send({msg: 'not authenticated'});
//   }
// } 

// app.get('/signin', (req, res) => {
//   res.cookie('session_id', '123456');
//   res.status(200).json({msg: 'Loggin In.'});
// })

// app.get('/protected', validateCookie, (req, res) => {
//   res.status(200).json({msg: 'you are authorized'});
// });