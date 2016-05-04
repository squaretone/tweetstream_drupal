<?php
/**
 * @file
 * AngularJS template to render a weather block.
 */
?>
<div ng-controller="tweetStreamCtrl" class="tweetstream-default">
  <a class="pause-stream" ng-click="toggleStream()" ng-show="debugMode">{{ pauseText }}</a>
  <div class="tweetstream-tweets" ng-repeat="tweet in tweets">
    <div class="tweet-wrapper">
      <div class="tweet media">
        <div class="media-left twitter-profile-image">
          <img class="media-object" ng-src="{{ tweet.profileImg }}" alt="profile image" />
        </div>
        <div class="media-body">
          <div class="media-heading">{{ tweet.name }} <small>{{ tweet.username }}</small></div>
          <div class="media-text">
            {{ tweet.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
