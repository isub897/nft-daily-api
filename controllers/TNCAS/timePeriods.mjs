const numberOfStats = 20;

const handleTimePeriod = (req, res, fs) => {
  
  fs.readFile(`./controllers/TNCAS/response${req.params['time']}.json`, (err, data) => {
    if (err) {
      res.status(400).json('failure reading file', err);
      return;
    }

    res.json(JSON.parse(data.toString()).slice(0, numberOfStats))

  })
}

export default handleTimePeriod;