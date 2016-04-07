var Twit = require('twit');
var _ = require('lodash');
var buffer = require('./tweetBuffer');

var Tweeter = {};
var client, stream;

// Creates a Twitter stream
Tweeter.createStream = function(path, params, cb) {
  // Create stream and pass to callback
  // @TODO: handle cases where stream already exists
  stream = client.stream(path, params);
  // Automatically buffer
  stream.on('tweet', function(tweet) {
    buffer.add(tweet);
  });
  cb(null, stream);
};

// Return any tweets in the buffer
Tweeter.getBuffer = function() {
  var latestTweets = buffer.get();
  return latestTweets;
};

module.exports = function(credentials) {
  // These need to be passed when the module initializes
  // @TODO: Check that these have been passed on init
  var requiredCredentials = [
    'consumer_key',
    'consumer_secret',
    'access_token',
    'access_token_secret'
  ];
  client = new Twit(credentials);
  return Tweeter;
};
