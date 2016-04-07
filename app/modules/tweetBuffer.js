var _ = require('lodash');

var TweetBuffer = {};

var buffer = [];

// Max number to store
TweetBuffer.max = 50;

// Add a tweet to the buffer and trim if needed
TweetBuffer.add = function(tweetObject) {
  buffer.push(tweetObject);
  if (buffer.length > TweetBuffer.max) {
    var removedTweet = buffer.shift();
  }
};

TweetBuffer.get = function(count) {
  var maxReturn = (count == undefined) ? TweetBuffer.max : count;
  var returnTweets = buffer.map(function(tweet, id) {
    if (id < maxReturn) {
      return tweet;
    }
  });

  return returnTweets;
};


module.exports = TweetBuffer;
