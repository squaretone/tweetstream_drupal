(function() {
  var app = angular.module('tweetStream', []);
  var debugMode = false;

  /**
   * Custom console.log function that only runs if debug mode is enabled
   */
  var tweetLog = function() {
    if (debugMode) {
      console.log.apply(console, arguments);
    }
  };

  // Angular Controller
  var tweetStreamCtrl = function($scope, tweetStreamSrvc) {
    $scope.tweets = [{a:1}, {b:2}];
    $scope.maxTweets = Drupal.settings.tweetstream.numTweets || 3;

    // Handle new tweets
    var addTweetHandler = function(tweet) {
      tweetLog('TWEET:', tweet);
      $scope.tweets.unshift(tweet);
      // trim to size
      $scope.tweets = $scope.tweets.slice(0, $scope.maxTweets);
      $scope.$apply();
    };

    // Handle connection info
    var connectHandler = function(options) {
      var starterTweets = options.starterTweets.slice(0, $scope.maxTweets);
      $scope.tweets = starterTweets;
      $scope.$apply();
    };

    var options = {
      // Define a 'server' value if running socket.io on a different server/port
      server: Drupal.settings.tweetstream.socketioUrl,
      onConnectCallback: connectHandler,
      onTweetCallback: addTweetHandler
    };
    tweetStreamSrvc.init(options);
  };

  // Angular Service
  var tweetStreamSrvc = function() {
    var cleanTweet = function(tweetRaw) {
      var tweet = {};
      tweet.name = tweetRaw.user.name;
      tweet.username = tweetRaw.user.screen_name;
      tweet.profileImg = tweetRaw.user.profile_image_url_https;
      tweet.text = tweetRaw.text;
      // Loop through extended_media to get photos and videos.
      tweet.media = [];
      if (typeof tweetRaw.extended_entities !== 'undefined') {
        var tweetMedia = tweetRaw.extended_entities;
        var mediaLength = tweetMedia.media.length;
        for (i = 0; i < mediaLength; i++) {
          var media = {
            url: tweetMedia['media'][i]['media_url'],
            width: tweetMedia['media'][i]['sizes']['thumb']['w'],
            height: tweetMedia['media'][i]['sizes']['thumb']['h']
          };
          tweet.media.push(media);
        }
      }
      return tweet;
    };
    var srvc = {
      socket: null
    };
    srvc.init = function(options) {
      var server = options.server;
      var socket = io.connect(server);
      tweetLog('Seting up Socket.io listeners');
      socket.on('connect', function() {
        tweetLog('connect',arguments);
      });
      // Pass config back to Controller
      socket.on('config', function (config) {
        tweetLog('config', config);
        var trimmedPrime = config.prime.reverse();
        if (options.onConnectCallback) {
          var cleanedTweets = trimmedPrime.map(cleanTweet);
          tweetLog('cleanedTweets',cleanedTweets);
          options.onConnectCallback({
            starterTweets: cleanedTweets
          });
        }
      });

      // Pass new tweet back to Controller
      socket.on('tweet', function (tweet) {
        // @TODO: normalize/strip tweet data
        if (options.onTweetCallback) {
          var tweetCleaned = cleanTweet(tweet);
          options.onTweetCallback(tweetCleaned);
        }
      });
    };

    return srvc;
  };

  // Add controller and service to the module/app
  app.controller('tweetStreamCtrl', tweetStreamCtrl);
  app.service('tweetStreamSrvc', tweetStreamSrvc);

  // When DOM is ready, bootstrap our app
  // @TODO: appRoot should be configurable via Drupal config
  angular.element(document).ready(function () {
    debugMode = Drupal.settings.tweetstream.debug;
    tweetLog('Angular.js using app root: %s', appRoot);
    var appRootSelector = Drupal.settings.tweetstream.appRoot;
    var appRoot = angular.element(document.querySelector(appRootSelector));
    angular.bootstrap(document, ['tweetStream']);
  });
})();
