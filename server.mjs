import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';
import timePeriods from './controllers/TNCAS/timePeriods.mjs'; 

const app = express();
app.use(express.json());
app.use(cors());


const urlTNCAS = 'https://top-nft-collections-and-sales.p.rapidapi.com/collections/30d';

const optionsTNCAS = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '837dc6b60amsh7c39ed5f163c497p15734ejsn48d377555198',
      'X-RapidAPI-Host': 'top-nft-collections-and-sales.p.rapidapi.com'
    }
  };

app.get('/24hr', (req, res) => {timePeriods.twentyFour(req, res, fs)});
app.get('/7d', (req, res) => {timePeriods.sevenDay(req, res, fs)});
app.get('/30d', (req, res) => {timePeriods.thirtyDay(req, res, fs)});
app.get('/AT', (req, res) => {timePeriods.allTime(req, res, fs)});




app.listen(3000);