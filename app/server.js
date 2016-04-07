require("dotenv").config();

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var TweeterLib = require('./modules/tweeter');

var port = process.env.PORT || 3000;
var stream, tweeter;

// @TODO: Make these configurable
var streamPath = 'statuses/filter';
var streamParams = { track: ['javascript', 'angularjs', 'jquery', 'nodejs', 'socketio'] };

// Initialize the twitter library
var tweeter = TweeterLib({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// Returns active stream to callback
// Initializes a new stream if it doesn't exist
var getTwitterStream = function(cb) {
  if (stream) {
    // Return active Twitter stream if it exists
    cb(null, stream);
  } else {
    // Create it and then return it
    tweeter.createStream(streamPath, streamParams, function(err, newStream) {
      // Save a reference
      stream = newStream;
      cb(err, newStream);
    });

    stream.on('tweet', function(tweet) {
      console.log('Tweet: [%s]: %s', tweet.id, tweet.user.screen_name);
      io.emit('tweet', tweet);
    });
  }
};

server.listen(port, function() {
  console.log('Server running at http://localhost:%s', port);
});

io.on('connection', function(socket) {
  console.log('%%%   Client connected...   %%%');
  // Get a buffer of any tweets
  var tweetBuffer = tweeter.getBuffer();

  // Send some configuration information to client
  socket.emit('config', {
    'streamPath': streamPath,
    'streamParams': streamParams,
    'prime': tweetBuffer
  });

  // Get a reference to the twitter stream and start broadcasting to
  // the connected user
  getTwitterStream(function(err, twitterStream) {
    // Let client know that connection to Twitter was successful
    socket.emit('status', 'connected to twitter stream');

    // @TODO: Handle error messages from Twitter connection
    twitterStream.on('error', function(error) {
      console.log("Error: ", error);
    });
  });

});
