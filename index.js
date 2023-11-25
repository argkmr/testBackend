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

app.post('/random', (req, res) => {
    const code = {
        code: req.body.code
    }
    res.send({
        "access_token": "ya29.a0AfB_byBx8DyzWdd-PaZiFJpeYPZ_NYqzrzE2Hvzwv2XA6_JbOKf05DUmzqO7Ps5PZoy7fBRTCR3P4NEWmB-4Dw2Kw_jXT3_kQM3Rysd12vZTEipWx9lRQlv_MK0-u9sQoPrTLSjjKBcWRjaC4DQVOtaA0jBwyoVNmNsraCgYKAToSARISFQHGX2MiNPqMpkiGFPf_SIi-fSozJA0171",
        "refresh_token": "1//0gB4hbsWsNwX4CgYIARAAGBASNwF-L9Ir4BWvUu57pKc61XGj6ew5WcKYMnFYiPcQh7-2YCs00pDgFpjq4e4aGhX5s9qswOfpMfw",
        "scope": "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile",
        "token_type": "Bearer",
        "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjViMzcwNjk2MGUzZTYwMDI0YTI2NTVlNzhjZmE2M2Y4N2M5N2QzMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MTU3ODIwMTYxNzUtcDJ0am04N2s3YWNyZXM5Zmo5NTA2dnNrMm1uaG01NG8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MTU3ODIwMTYxNzUtcDJ0am04N2s3YWNyZXM5Zmo5NTA2dnNrMm1uaG01NG8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDI1NzI4MjYxNzU1NDg3MTEyODUiLCJhdF9oYXNoIjoid3N0TXZYeGx4b0dldkN5RDhyR0FPdyIsIm5hbWUiOiJBbnVyYWcgS3VtYXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSUx1WC1qTWFxT2VJanhhM0VUUmNCaUtxTnZPM1NHckNJejVlUnRnbGpidWxjPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFudXJhZyIsImZhbWlseV9uYW1lIjoiS3VtYXIiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTcwMDU5OTY1NiwiZXhwIjoxNzAwNjAzMjU2fQ.RkgGCocdMXNgipUWQPC0wukA95ymX0NJQLWQiCRHfOGgEl3gMhe-VEI1baZ2c4vKQN4VXMGV51TM5136G33rSp095bDEsLAdJBI-xTUFhd1NlEJVmFoL3CSWwnAyiUtH_zlQzznhj2h5US42DvUVK1c-CpjQKlRV2Ij7dRZJ6-KgzyL9iRPEzRzsLehHhWTVYOa0-G6MBqZOuBT7jwd5tF7_V37pO6z5LFxXQF0MBj2VTD-DubS6iqD8W_NRY8dNCS_4dothn7NHi70Or1PjPTdfJUerDs5PnX_lqwHGZnaLWoBgLjDwYrCoc4_GgZKB3jv8ERT6oVoGwpBz5EdYFA",
        "expiry_date": 1700603253518
    });
});


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
