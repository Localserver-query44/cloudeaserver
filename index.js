const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
const fs = require("fs");
const path = require("path");
const cache = require('memory-cache'); 
const app = express();
const port = 3000;

const BASE_URL = 'https://free-ff-api-src-5plp.onrender.com/api/v1';
const ICON_BASE_URL = 'https://www.library.freefireinfo.site/icons/';
const CACHE_DURATION = 24 * 60 * 60 * 1000; 

const supportedRegions = ['IND', 'BR', 'SG', 'RU', 'ID', 'TW', 'US', 'VN', 'TH', 'ME', 'PK', 'CIS', 'BD'];

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));


const fetchFromApi = async (url, res, cacheKey) => {
    try {
        let cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log("Returning cached data for: ", cacheKey);
            return res.send(cachedData);
        }

        const response = await axios.get(url);
        if (!response.data || Object.keys(response.data).length === 0) {
            return res.status(429).json({
                error: 'API limit has been reached. The limit will reset in 1-2 hours.'
            });
        }

        const responseData = JSON.stringify(response.data, null, 2);
        cache.put(cacheKey, responseData, CACHE_DURATION);

        res.setHeader('Content-Type', 'application/json');
        res.send(responseData);
    } catch (error) {
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch data',
            details: error.message
        });
    }
};

const isValidRegion = (region) => supportedRegions.includes(region.toUpperCase());

app.use((req, res, next) => {
    if (req.path === '/index.js') {
        res.status(403).send('Forbidden');
    } else {
        next();
    }
});

app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get('/api/v1/icon', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Please provide an "id" parameter.' });
    }
    const iconUrl = `${ICON_BASE_URL}${id}.png`;
    try {
        const response = await axios.get(iconUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        res.status(404).json({ error: 'Not GET Icon' });
    }
});

app.get('/api/v1/account', (req, res) => {
    const { region, uid } = req.query;
    if (!region || !uid) {
        return res.status(400).json({ error: 'Please provide both "region" and "uid" parameters.' });
    }
    if (!isValidRegion(region)) {
        return res.status(400).json({ error: `Region ${region} is not supported. Supported regions are: ${supportedRegions.join(', ')}` });
    }
    const url = `${BASE_URL}/account?region=${region}&uid=${uid}`;
    const cacheKey = `account-${region}-${uid}`;
    fetchFromApi(url, res, cacheKey);
});

app.get('/api/v1/craftlandProfile', (req, res) => {
    const { region, uid } = req.query;
    if (!region || !uid) {
        return res.status(400).json({ error: 'Please provide both "region" and "uid" parameters.' });
    }
    if (!isValidRegion(region)) {
        return res.status(400).json({ error: `Region ${region} is not supported. Supported regions are: ${supportedRegions.join(', ')}` });
    }
    const url = `${BASE_URL}/craftlandProfile?region=${region}&uid=${uid}`;
    const cacheKey = `craftlandProfile-${region}-${uid}`;
    fetchFromApi(url, res, cacheKey);
});

app.get('/api/v1/craftlandInfo', (req, res) => {
    const { region, map_code } = req.query;
    if (!region || !map_code) {
        return res.status(400).json({ error: 'Please provide both "region" and "map_code" parameters.' });
    }
    if (!isValidRegion(region)) {
        return res.status(400).json({ error: `Region ${region} is not supported. Supported regions are: ${supportedRegions.join(', ')}` });
    }
    const url = `${BASE_URL}/craftlandInfo?region=${region}&map_code=${map_code}`;
    const cacheKey = `craftlandInfo-${region}-${map_code}`;
    fetchFromApi(url, res, cacheKey);
});

app.get('/api/v1/playerstats', (req, res) => {
    const { region, uid } = req.query;
    if (!region || !uid) {
        return res.status(400).json({ error: 'Please provide both "region" and "uid" parameters.' });
    }
    if (!isValidRegion(region)) {
        return res.status(400).json({ error: `Region ${region} is not supported. Supported regions are: ${supportedRegions.join(', ')}` });
    }
    const url = `${BASE_URL}/playerstats?region=${region}&uid=${uid}`;
    const cacheKey = `playerstats-${region}-${uid}`;
    fetchFromApi(url, res, cacheKey);
});

app.get('/api/v1/wishlistitems', (req, res) => {
    const { region, uid } = req.query;
    if (!region || !uid) {
        return res.status(400).json({ error: 'Please provide both "region" and "uid" parameters.' });
    }
    if (!isValidRegion(region)) {
        return res.status(400).json({ error: `Region ${region} is not supported. Supported regions are: ${supportedRegions.join(', ')}` });
    }
    const url = `${BASE_URL}/wishlistitems?region=${region}&uid=${uid}`;
    const cacheKey = `wishlistitems-${region}-${uid}`;
    fetchFromApi(url, res, cacheKey);
});

app.get('/api/v1/guildInfo', (req, res) => {
    const { region, guildID } = req.query;
    if (!region || !guildID) {
        return res.status(400).json({ error: 'Please provide both "region" and "guildID" parameters.' });
    }
    if (!isValidRegion(region)) {
        return res.status(400).json({ error: `Region ${region} is not supported. Supported regions are: ${supportedRegions.join(', ')}` });
    }
    const url = `${BASE_URL}/guildInfo?region=${region}&guildID=${guildID}`;
    const cacheKey = `guildInfo-${region}-${guildID}`;
    fetchFromApi(url, res, cacheKey);
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API! Please use the available endpoints.' });
});


app.get('/status', (req, res) => {
    const status = {
        status: 'OK',
        uptime: process.uptime(), 
        memoryUsage: process.memoryUsage(), 
        timestamp: new Date().toISOString(), 
        message: 'API is running smoothly'
    };
    
    res.json(status);
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});