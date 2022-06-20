const specificNews = (req, res, fs) => {
    fs.readFile('./controllers/BCN/NDTV.json', (err, data) => {
        if (err) {
          res.status(400).json('failure reading file', err);
          return;
        }
    
        res.json(JSON.parse(data.toString()))
    
      })
}

const allNews = (req, res, fs) => {
    fs.readFile('./controllers/BCN/news.json', (err, data) => {
        if(err) {
          res.status(400).json('failure reading file', err);
          return;
        }
    
        res.json(JSON.parse(data.toString()))
      })
}

export default {specificNews, allNews}

