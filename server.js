// Import modules
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const socket = require('./src/middlewares/socket');

// Set up CORS
const whiteList = ['http://localhost:3000'];

const io = require('socket.io')(server, {
  cors: whiteList.map((origin) => {
    origin;
  }),
});

io.on('connection', () => {
  console.log('Successfully connected to the socket!');
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (whiteList.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS!'));
      }
    },
  })
);

// Middlewares
app.use(morgan('dev'));
app.use(helmet.noSniff());
app.use(socket(io));

// Parse Request application/json and urlencoded
app.use(express.urlencoded({ extended: 'false' }));
app.use(express.json());

// Setup static directory
app.use(express.static(path.join(__dirname, './public')));

// Define Routes
app.use('/auth', require('./src/routes/authRoute'));

// Listening to the server
const { APP_URL } = process.env;
const PORT = process.env.APP_PORT || 8080;
server.listen(PORT, () => console.log(`Magic happen at ${APP_URL}:${PORT}/`));
