/*
 * File: directives.js
 * Description: Defines the directives we will be sending to Alexa
 *    and allows our skill easy access to them.
 */

'use strict';

// Require our APL templates
var searchResultsTemplete = require('../apl/searchResultsTemplete.json');
var defaultTemplate = require('../apl/defaultTemplate.json');

// Alexa Presentation Language (APL) Directives
const APL = {
  // returns a APL directive for game search w/ results
  setSearchDisplay: function (games, backgroundImage, pageTitle, logoUrl, hintText) {
    let payload = {
      "type": "entireDisplay",
      "backgroundImageUrl": backgroundImage,
      "pageTitle": pageTitle,
      "skillLogo": logoUrl,
      "hintText": hintText,
      "results": games
    }
    let data = {
        "type": "object",
        "properties": payload,
        "transformers": [
          {
            "inputPath": "results[*].summarySSML",
            "outputName": "summarySpeech",
            "transformer": "ssmlToSpeech"
          },
          {
            "inputPath": "results[*].summarySSML",
            "outputName": "summaryText",
            "transformer": "ssmlToText"
          },
          {
          "inputPath": "hintText",
          "transformer": "textToHint"
        }
      ]
    }
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "token": "search",
      "document": searchResultsTemplete.document,
      "datasources": {data}
    };
  },

  // returns a RenderDocument directive for all visuals, except for song displaying
  setDefaultDisplay: function (backgroundImageUrl, skillTitle, message, logoUrl, hintText) {
    let data = {
      "backgroundImageUrl": backgroundImageUrl,
      "skillTitle": skillTitle,
      "message": message,
      "logoUrl": logoUrl,
      "hintText": hintText
    }
    console.log(data);
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "document": defaultTemplate.document,
      "datasources": {data}
    };
  },

  setCommands: function (commands, token) {
    return {
      "type" : "Alexa.Presentation.APL.ExecuteCommands",
      "token": token,
      "commands": commands
    };
  }
};

module.exports.APL = APL;