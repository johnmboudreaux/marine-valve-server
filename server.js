const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(express.static('src'));

const requireHTTPS = (request, response, next) => {
  if (request.header('x-forwarded-proto') !== 'https') {
    return response.redirect(`https://${request.header("host")}${request.url}`);
  }
  next();
};
if (process.env.NODE_ENV === 'production') {
  app.use(requireHTTPS);
}

app.post('/api/v1/messageReceived', (request, response) => {
  const data = request.body;

  if (data.name && data.email && data.message && !data.city) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'industrial.marinevalve@gmail.com',
        pass: process.env.EMAIL_KEY,
      },
    });

    const mailOptions = {
      from: 'industrial.marinevalve@gmail.com',
      to: 'industrial.marinevalve@gmail.com',
      subject: 'New Request From Marine Valve App',
      text: `Name: ${data.name} \n
             Email: ${data.email} \n
             Message: ${data.message} \n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('ERR', error);
      } else {
        response.status(201).json({
          success: true,
        });
      }
    });
  } else if (data.City) {
    response.status(406).json({
      success: false,
      error: 'Bot Detected',
    });
  } else {
    response.status(406).json({
      success: false,
      error: 'Missing Required Field',
    });
  }
});

app.listen(4000, () => console.log('Marine Valve listening on port 4000!'));

module.exports = app;

