require("dotenv").config();

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var TweeterLib = require('./modules/tweeter');
var request = require('request');

var port = process.env.PORT || 3000;
var streamJSONUrl = process.env.STREAMJSONURL || 'http://localhost:' + port + '/default-stream-config.json';
var stream, tweeter;

// @TODO: Make these configurable
//var streamPath = 'statuses/filter';
//var streamParams = { track: ['javascript', 'angularjs', 'jquery', 'nodejs', 'socketio'] };
var streamPath;
var streamParams;

// Initialize the twitter library
var tweeter = TweeterLib({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

/**
 * Fetch a JSON object with stream config data
 * @param  {string}   JSONUrl URL to fetch JSON filter
 * @param  {Function} cb      Pass results to this Function
 */
var loadStreamConfig = function(JSONUrl, cb) {
  request(JSONUrl, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      var configJSON;
      try {
        configJSON = JSON.parse(body);
        cb(null, configJSON);
      } catch(err) {
        cb(err);
      }
    } else {
      var returnError = (!err) ? res.statusCode : err;
      cb(returnError);
    }
  })
};

// Returns active stream to callback.
// Initializes a new stream if it doesn't exist.
var getTwitterStream = function(cb) {
  if (stream) {
    // Return active Twitter stream if it exists
    cb(null, stream);
  } else {
    // Fetch config info from our JSON endpoint
    loadStreamConfig(streamJSONUrl, function(err, configJSON) {
      if (!err) {
        var streamConfig = configJSON.stream;
        if (streamConfig) {
          streamPath = streamConfig.path;
          streamParams = streamConfig.params;

          // Create stream it and pass it to the callback function
          tweeter.createStream(streamPath, streamParams, function(err, newStream) {
            // Save a reference
            stream = newStream;
            cb(err, newStream);

            // Globally emit new tweets
            stream.on('tweet', function(tweet) {
              console.log('Tweet: [%s]: %s', tweet.id, tweet.user.screen_name);
              io.emit('tweet', tweet);
            });
          });
        } else {
          console.log('Error parsing: %s', streamJSONUrl);
        }

      } else {
        console.log('Error with config file: %s', streamJSONUrl);
      }
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
