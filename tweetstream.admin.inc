<?php
/**
 * @file
 *  Admin functions for Tweenstream
 */

/**
 * Custom page callback to return config data to be used
 * by socket.io when connecting to the Twitter streaming api.
 */
function tweetstream_json_config() {
  // The data is stored in variables. $track is the terms being looked for
  // in the tweets, and $follow is the users whose tweets we want.
  // See https://dev.twitter.com/streaming/overview/request-parameters
  $track = array_map('trim', explode(',', variable_get('tweetstream_track', '')));
  $follow = array_map('trim', explode(',', variable_get('tweetstream_follow', '')));

  $data = array(
    'stream' => array(
      'path' => 'statuses/filter',
      'params' => array(
        'track' => $track,
        'follow' => $follow
      ),
    ),
  );

  return drupal_json_output($data);
}
