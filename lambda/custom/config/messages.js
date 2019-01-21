/*
 * Video Game Finder Alexa Skill
 * Author: Austin Wilson
 * Copyright 2018
 * 
 * 
 * File: messages.js
 * Description: File that holds all of the speech outputs and their translations
 */

'use strict';

const settings = require('./settings');

// Game Title in English
const SKILL_TITLE = settings.SKILL_TITLE;

// Translations
const messages = {
  // Translations for English (ALL)
  en: {
    translation: {
      'WELCOME': {
        outputSpeech: 'Welcome to ' + SKILL_TITLE + '! For a better experience, switch to a screened device such as an Echo Show or a fire TV. What are you intrested in doing today?',
        outputSpeechDisplay: 'Welcome to ' + SKILL_TITLE + '! What are you intrested in doing today?',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        displayTitle: SKILL_TITLE + ' - Welcome',
        displayText: 'What would you like to do?'
      },
      'GENERAL_HELP': {
        outputSpeech: 'Try asking me to find you a game, or say "search" to search for a game. ' +
          'What would you like to do? ',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        displayTitle: SKILL_TITLE + ' - Help',
        displayText: 'I can tell you expected arrivals of transit for a specific station on a route.'
      },
      'UNHANDLED_REQUEST': {
        outputSpeech: "Sorry, I didn't get that. Please say again!",
        reprompt: "Please say it again. You can ask for help if you're not sure what to do."
      },
      //Update invalid prompts
      'INVALID_INTERACTION': {
        GO_BACK: 'I\'m sorry, but you cannot do that here. Try searching for a game!',
        STOP_VIDEO: 'I\'m sorry, but you cannot do that here. Try searching for a game!',
        PLAY_VIDEO: 'I\'m sorry, but you cannot do that here. Try searching for a game!',
        SELECT_ITEM: 'I\'m sorry, but you cannot do that here. Try searching for a game!',
        NAVIGATE_TO_ITEM: 'I\'m sorry, but you cannot do that here. Try searching for a game!',
        GO_TO_SLIDESHOW: 'I\'m sorry, but you cannot do that here. Try searching for a game!',
        READ_TEXT: 'I\'m sorry, but you cannot do that here. Try searching for a game!'
      },
      'GOOD_BYE': {
        outputSpeech: "Ok, see you next time!",
        reprompt: ''
      },
      'GENERAL_HINT': [
          'find me a game'
      ],
      'SEARCH_HINT': [
        'select option 1'
      ],
      'GENERAL_REPROMPT': {
        reprompt: "Sorry, I didn't catch that, what would you like to do next?"
      },
      'SEARCH_RESULTS': {
        speech: "I have sent a list of games I found to your Alexa App...",
        speechWithDisplay: "Here are some games I found...",
        reprompt: 'What\'s next?',
        pageTitleDiscover: SKILL_TITLE + ' - Discover',
        pageTitleSearch: SKILL_TITLE + ' - Search: {{keyword}}'
      },
      'NO_SEARCH_RESULTS': {
        outputSpeech: 'I\'m sorry, but I cannot find any games matching that criteria.',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        displayTitle: SKILL_TITLE + ' - No Results',
        displayText: 'I\'m sorry, but I cannot find any games matching that criteria.'
      },
      'SEARCH_RESULT_ITEM_INFO': {
        speech: 'Here\'s what I found',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?"
      },
      'RE_SHOW_RESULTS': {
        speech: 'Now showing the overall results. Let me know if you want to know information for a specific game.',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        pageTitleDiscover: SKILL_TITLE + ' - Discover',
        pageTitleSearch: SKILL_TITLE + ' - Search: {{keyword}}'
      },
      'VIDEO_END': {
        speech: 'What else would you like to do?',
        reprompt: "What else would you like to do?"
      },
      'VIDEO_PLAY': {
        speech: 'Playing trailer...',
        reprompt: "What else would you like to do?"
      },
      'NO_DISPLAY': {
        speech: 'You must have a screened device to be able to preform that action.'
      },
      'API_CALL_ERROR': "I'm having difficulty accessing that part of my memory... Please try again later!"
    }
  }
};

module.exports = messages;