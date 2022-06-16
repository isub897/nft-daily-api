import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(cors());


const url = 'https://top-nft-collections-and-sales.p.rapidapi.com/collections/30d';

const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '837dc6b60amsh7c39ed5f163c497p15734ejsn48d377555198',
      'X-RapidAPI-Host': 'top-nft-collections-and-sales.p.rapidapi.com'
    }
  };

  
  //   fetch(url, options)
  //   .then(res => res.json())
  //   .then(json => res.json(json))
  //   .catch(err => console.error('error:' + err));
  




// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {

  fs.readFile('./response.json', (err, data) => {
    if (err) {
      res.status(400).json('failure reading file', err);
      return;
    }

    res.json(JSON.parse(data.toString()))

  })
})

app.listen(3000);