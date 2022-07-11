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
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuidv4()}-${originalname}`);
  }
});
const upload = multer({ storage })
// `${originalname}-${uuidv4()}`

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors({
  credentials: true,
   origin: 'http://localhost:3001'
}));
app.use(express.static('public'));



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
  cookie: { secure: false,
            maxAge: 30 * 60 * 1000},
  saveUninitialized: false,
}))


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

app.get('/dashboard', (req, res) => {
  if(req.session.authenticated) {
    postgres('users').where('email', req.session.user)
    .then(user => res.json(user))
    .catch(err => res.status(400).json("failure"))
  } else {
    res.json({msg: false})
  }
})

app.post('/register', (req, res) => {
  const {username, email, password, confirm} = req.body;
  if (!(username && email && password && confirm)) {return res.status(400).json('fill')}
  if(password !== confirm) {return res.status(400).json('matching')}
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
        req.session.authenticated = true;
        req.session.user = email;
        return postgres('users').where('email', email)
        .then(user => res.status(200).json(user[0]))
        .catch(err => res.status(400).json('failure'))
      })
      .catch(function(err) {
        return res.status(400).json('failure')
      });
    }
  }) 
});  
  

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) return res.status(400).json('fill');
  postgres('login').where('email', email)
  .then(response => {
    if(bcrypt.compareSync(password, response[0].hash)) {
      postgres('users').where('email', email)
      .then(user => {
        req.session.authenticated = true;
        req.session.user = email;
        return res.status(200).json(user[0]);
      })
      .catch(err => res.status(400).json('failure'));      
    } else {
      return res.status(400).json('failure');
    }
  })
  .catch(err => res.status(400).json('failure'))
})

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) {res.status(400).json("failure")}
  })
  res.redirect('/');
})

app.post('/upload', upload.single('avatar'), (req, res) => {
  return res.json({ status: "OK" });
})

  
// NEWS end-points
app.get('/NDTV', (req, res) => {news.specificNews(req, res, fs)})
app.get('/news', (req, res) => {news.allNews(req, res, fs)})

// CHARTS end-point (there is a problem with this route most likely linked to the way i reference the /:time route)
// app.get('/:time', (req, res) => handleTimePeriod(req, res, fs));


app.get('/', (req, res) => {
  res.json("you made it it");
})


app.listen(3000);