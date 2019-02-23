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
      "searchedGame": searchedGame,
      "backgroundImageUrl": backgroundImage,
      "pageTitle": pageTitle,
      "skillLogo": logoUrl,
      "results": games,
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
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "token": "token",
      "document": resultsOverallTemplate.document,
      "datasources": {data}
    };
  },

  // returns a APL directive for game search w/ results (INFO)
  setSearchInfoDisplay: function (game) {
    let payload = {
      "result": game
    }
    let data = {
      "type": "object",
      "properties": payload,
      "transformers": [
        {
          "inputPath": "result.summarySSML",
          "outputName": "summarySpeech",
          "transformer": "ssmlToSpeech"
        },
        {
          "inputPath": "result.summarySSML",
          "outputName": "summaryText",
          "transformer": "ssmlToText"
        }
      ]
    }
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "token": "token",
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
      "token": "token",
      "document": defaultTemplate.document,
      "datasources": {data}
    };
  },

  setCommands: function (commands, token) {

    // commands.push({
    //   "type": "Idle",
    //   "delay": 30000
    // });

    return {
      "type" : "Alexa.Presentation.APL.ExecuteCommands",
      "token": token,
      "commands": [
        {
          "type": "Parallel",
          "commands": commands
        }
      ]
    };
  }
};

module.exports.APL = APL;