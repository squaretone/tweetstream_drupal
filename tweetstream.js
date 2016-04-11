(function() {
  var app = angular.module('tweetStream', []);

  // Angular Controller
  var tweetStreamCtrl = function($scope, tweetStreamSrvc) {
    $scope.tweets = [];
    $scope.maxTweets = 5;

    // Handle new tweets
    var addTweetHandler = function(tweet) {
      console.log('new tweet', tweet);
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
      return tweet;
    };
    var srvc = {
      socket: null
    };
    srvc.init = function(options) {
      var server = options.server;
      var socket = io.connect(server);

      // Pass config back to Controller
      socket.on('config', function (config) {
        console.log('config', config);
        var trimmedPrime = config.prime.reverse();
        if (options.onConnectCallback) {
          var cleanedTweets = trimmedPrime.map(cleanTweet);
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
    var appRootId = '#' + Drupal.settings.tweetstream.appRoot;
    var appRoot = angular.element(document.querySelector(appRootId));
    angular.bootstrap(appRoot, ['tweetStream']);
  });
})();