/*
 * File: settings.js
 * Description: File that configures the behavior of the game
 */

"use strict";

module.exports = (function () {
  /**
   * APP_ID:
   *  The skill ID to be matched against requests for confirmation.
   *  It helps protect against spamming your skill.
   *  This value can also be configured in lambda as described in the Hackster instructions.
   */

  const APP_ID = '';

  const API_URL = "https://api-v3.igdb.com/search/";
  const API_KEY = "af3fe2351343ef7dd1171ef25b018685";

  const VIDEO_CONVERTER_URL = "https://you-link.herokuapp.com/?url=https://www.youtube.com/watch?v=";

  const APL_ENABLED = true;

  /**
   * STORAGE.SESSION_TABLE:
   *  The name of the table in DynamoDB where you want to store session and game data.
   */
  const STORAGE = {
    // Session persistence
    SESSION_TABLE: 'VideoGameFinder'
  };

  const AUDIO = Object.freeze({
      
  });

  /**
   * A set of images to show on backgrounds and in display templates when the skill
   * is used with a device with a screen like the Echo Show or Echo Spot
   * https://developer.amazon.com/docs/custom-skills/display-interface-reference.html
   *
   * The skill template chooses images randomly from each array to provide some
   * variety for the user.
   */
  const IMAGES = Object.freeze({
    BACKGROUND_IMAGES: [
      'https://s3.amazonaws.com/austinmatthuw/WhatsThatSong/resources/background.jpg',
    ],
    LOGO: "https://s3.amazonaws.com/austinmatthuw/VideoGameFinder/icon_512.png"
  });

  // return the externally exposed settings object
  return Object.freeze({
    SKILL_TITLE: 'Video Game Finder',
    VIDEO_CONVERTER_URL: VIDEO_CONVERTER_URL,
    API_URL: API_URL,
    API_KEY: API_KEY,
    APP_ID: APP_ID,
    APL_ENABLED: APL_ENABLED,
    STORAGE: STORAGE,
    AUDIO: AUDIO,
    IMAGES: IMAGES,
    LOG_LEVEL: 'DEBUG',
    pickRandom(arry) {
      if (Array.isArray(arry)) {
        return arry[Math.floor(Math.random() * Math.floor(arry.length))]
      }
      return arry;
    }
  });
})();