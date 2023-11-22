import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.file'
];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hi There!")
})

app.get('/getAuthUrl', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
    });
    console.log(typeof authUrl);
    res.type('text/plain').send(authUrl);
})

app.post('/getToken', (req, res) => {
    if (req.body.code === null) return res.status(400).send("Invalid Requst");
    oAuth2Client.getToken(req.body.code, (err, token) => {
        if (err) {
            console.error("Error retriving the token : ", err);
            return res.status(400).send("Error retriving the access token")
        }
        res.send(token);
    });
});

app.post('/getDriveData', (req, res) => {
    if (req.body.token === null) return res.status(400).send("Data not found");
    oAuth2Client.setCredentials(req.body.token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    drive.files.list({
        pageSize: 10,
    }, (err, response) => {
        if (err) {
            console.log("The API returned an error " + err);
            return res.status(400).send(err);
        }
        const files = response.data.files;
        if (files.length) {
            console.log("Files:");
            files.map((file) => {
                console.log(`name: ${file.name}, id: ${file.id}`);
            });
        } else {
            console.log("No files found");
        }
        res.send(files);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}/`));
