/*
 * File: directives.js
 * Description: Defines the directives we will be sending to Alexa
 *    and allows our skill easy access to them.
 */

'use strict';

// Require our APL templates
var resultsOverallTemplate = require('../apl/resultsOverallTemplate.json');
var resultsInfoTemplateScreenshots = require('../apl/resultsInfoTemplateScreenshots.json');
var resultsInfoTemplateMain = require('../apl/resultsInfoTemplateMain.json');
var resultsInfoTemplateVideo = require('../apl/resultsInfoTemplateVideo.json');
var defaultTemplate = require('../apl/defaultTemplate.json');
var settings = require('../config/settings.js')

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
  setSearchInfoDisplay: function (game, scheme) {
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
    var document;
    switch(scheme) {
      case settings.INFO_SCHEME.MAIN:
        document = resultsInfoTemplateMain.document;
        console.log("Render Main view");
        break;
      case settings.INFO_SCHEME.SCREENSHOTS:
        document = resultsInfoTemplateScreenshots.document;
        console.log("Render Main screenshots");
        break;
      case settings.INFO_SCHEME.VIDEO:
        document = resultsInfoTemplateVideo.document;
        console.log("Render Main video");
        break;
    }
    return {
      "type": 'Alexa.Presentation.APL.RenderDocument',
      "version": '1.0',
      "token": "token",
      "document": document,
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