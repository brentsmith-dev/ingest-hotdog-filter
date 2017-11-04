'use strict';

const express = require('express');
const Ingest = require('../services/Ingest');

var router = express.Router({
  mergeParams: true
});

router.route('/encoded')
  .post(function (req, res) {

    console.log(JSON.stringify(req.body));

    try {
      var videoId = req.body["event_object[data][video][id]"];
    } catch (error) {
      return console.log('Error : ', error);
    }

    console.log('Video ID : ', videoId);

    Ingest.service.Videos.getById(videoId, (error, video) => {
      var video_url;

      if (error) {
        return console.log('Error : ', error);
      }

      console.log('Videos : ', video);

      video_url = video.playback_urls[0];

      // TODO: Make the request to Clarifai.

      console.log('Video : ', video_url);

      res.status(200).send();
    });

    // Call ingest to get the video record for the url.
    // Send the video url to clarifai to determine if its safe.
    // Setup some sort of database to handle storing the information.
    // Update the video record with the result in the description.

  });

module.exports = router;
