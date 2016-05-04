<?php
/**
 * @file
 * AngularJS template to render a weather block.
 */
?>
<div ng-controller="tweetStreamCtrl">
  <div class="messages" ng-repeat="tweet in tweets">
    <div class="tweet media">
      <div class="media-left">
        <img class="media-object" ng-src="{{ tweet.profileImg }}" alt="profile image" />
      </div>
      <div class="media-body">
        <h5 class="media-heading">{{ tweet.name }} <small>{{ tweet.username }}</small></h5>
        {{ tweet.text }}
      </div>
      <div ng-repeat="item in tweet.media">
        <img ng-src="{{ item.url }}" width="{{ item.width }}" height="{{ item.height }}"/>
      </div>
    </div>
  </div>
</div>
