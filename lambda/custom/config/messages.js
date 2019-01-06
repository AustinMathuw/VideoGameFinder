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
        outputSpeech: 'Welcome to ' + SKILL_TITLE + '! What are you intrested in doing today?',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?",
        displayTitle: SKILL_TITLE + ' - Welcome',
        displayText: 'Which station are you intrested in?'
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
      'SEARCH_RESULTS': {
        speech: "Here are some games I found...",
        reprompt: 'What\'s next?',
        pageTitle: SKILL_TITLE + ' - Search: {{keyword}}'
      },
      'SEARCH_RESULT_ITEM_INFO': {
        speech: 'Here is some information for {{gameTitle}}',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?"
      },
      'RE_SHOW_RESULTS': {
        speech: 'Now showing the overall results. Let me know if you want to know information for a specific game.',
        reprompt: "Sorry, I didn't catch that, what would you like to do next?"
      },
      'VIDEO_END': {
        speech: 'What else would you like to do?',
        reprompt: "What else would you like to do?"
      },
      'API_CALL_ERROR': "I'm having difficulty accessing that part of my memory... Please try again later!"
    }
  }
};

module.exports = messages;