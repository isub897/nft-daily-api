const twentyFour = (req, res, fs) => {

  fs.readFile('./controllers/TNCAS/response24hr.json', (err, data) => {
    if (err) {
      res.status(400).json('failure reading file', err);
      return;
    }

    res.json(JSON.parse(data.toString()))

  })
}

const sevenDay = (req, res, fs) => {
  
  fs.readFile('./controllers/TNCAS/response7d.json', (err, data) => {
    if (err) {
      res.status(400).json('failure reading file', err);
      return;
    }

    res.json(JSON.parse(data.toString()))

  })
}

const thirtyDay = (req, res, fs) => {
  
  fs.readFile('./controllers/TNCAS/response30d.json', (err, data) => {
    if (err) {
      res.status(400).json('failure reading file', err);
      return;
    }

    res.json(JSON.parse(data.toString()))

  })

}

const allTime = (req, res, fs) => {
  
  fs.readFile('./controllers/TNCAS/responseAT.json', (err, data) => {
    if (err) {
      res.status(400).json('failure reading file', err);
      return;
    }

    res.json(JSON.parse(data.toString()))

  })

}

export default {twentyFour, sevenDay, thirtyDay, allTime};