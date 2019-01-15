/*
 * File: directives.js
 * Description: Defines the directives we will be sending to Alexa
 *    and allows our skill easy access to them.
 */

'use strict';

// Require our APL templates
var resultsOverallTemplate = require('../apl/resultsOverallTemplate.json');
var resultsInfoTemplate = require('../apl/resultsInfoTemplate.json');
var defaultTemplate = require('../apl/defaultTemplate.json');

// Alexa Presentation Language (APL) Directives
const APL = {
  // returns a APL directive for game search w/ results (OVERALL)
  setSearchOverallDisplay: function (games, searchedGame, backgroundImage, pageTitle, logoUrl, hintText) {
    let payload = {
      "type": "resultsDisplay",
      "searchedGame": searchedGame,
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
      "document": resultsOverallTemplate.document,
      "datasources": {data}
    };
  },

  // returns a APL directive for game search w/ results (INFO)
  setSearchInfoDisplay: function (games, searchedGame) {
    let payload = {
      "type": "resultsPager",
      "searchedGame": searchedGame,
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
        }
      ]
    }
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "token": "search",
      "document": resultsInfoTemplate.document,
      "datasources": {data}
    };
  },

  setDefaultDisplay: function (backgroundImageUrl, skillTitle, message, logoUrl, hintText) {
    let payload = {
      "backgroundImageUrl": backgroundImageUrl,
      "skillTitle": skillTitle,
      "message": message,
      "logoUrl": logoUrl,
      "hintText": hintText
    }
    let data = {
      "type": "object",
      "properties": payload,
      "transformers": [
        {
          "inputPath": "hintText",
          "transformer": "textToHint"
        }
      ]
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