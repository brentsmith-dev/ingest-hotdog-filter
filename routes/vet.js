'use strict';

const express = require('express');
const Ingest = require('../services/Ingest');
const Clarifai = require('clarifai');
const nconf = require('nconf');
const request = require('request');

const CLARIFAI_API = nconf.get('CLARIFAI_API');

var clarifai = new Clarifai.App({apiKey: CLARIFAI_API});

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

    //console.log('Video ID : ', videoId);

    Ingest.service.Videos.getById(videoId, (error, response) => {
      var video_url;
      var video;

      if (error) {
        return console.log('Error : ', error);
      }

      video = response.data;

      //console.log('Videos : ', video);

      video_url = video.targets[video.targets.length - 1].playback_url;

      // TODO: Make the request to Clarifai.
      console.log('Video : ', video_url);

      setTimeout(vetVideo.bind(null, video_url), 5000);

      // Next tick do the call to validate the video.
      res.status(200).send();
    });

    // Call ingest to get the video record for the url.
    // Send the video url to clarifai to determine if its safe.
    // Write to the video description.
    // Update the video record with the result in the description.

  });

function vetVideo(video_url) {
  console.log('Start vetting : ', video_url);
  console.log('Downloading...');

  request(video_url, (res) => {
    console.log('Download complete.');

    clarifai.models.predict(Clarifai.GENERAL_MODEL, video_url, {video: true})
      .then(function (response) {
        try {
          console.log('Response : ', JSON.stringify(response));
        } catch (e) {
          console.log('Error : ', e);
        }
      })
      .catch(function (error) {
        try {
          console.log('Caught Error : ', error.data);
        } catch (e) {
          console.log('Caught another error : ', e);
        }
      });

  })

}

module.exports = router;
