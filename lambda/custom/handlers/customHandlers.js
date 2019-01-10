/*
 * File: customHandlers.js
 * Description: File that handlers the actual intent & event request globally
 */

const logger = require('../utils/logger.js');
const Finder = require('../utils/finder.js');

const helpers = {
  
}

const customHandlers = {
  InProgressSearchIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.InProgressSearchIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'SearchIntent'
        && requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
      logger.debug('CUSTOM.InProgressSearchIntent: handle');
      let { responseBuilder, requestEnvelope } = handlerInput;
      const currentIntent = requestEnvelope.request.intent;
  
      return responseBuilder
        .addDelegateDirective(currentIntent)
        .getResponse();
    },
  },
  CompletedSearchIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.CompletedSearchIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'SearchIntent'
        && requestEnvelope.request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.CompletedSearchIntent: handle');
      
      let {
        attributesManager,
        requestEnvelope
      } = handlerInput;

      await Finder.search(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  },
  InProgressDiscoverIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.InProgressSearchIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && requestEnvelope.request.intent.name === 'CompleteDiscoverIntent'
        && requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
      logger.debug('CUSTOM.InProgressSearchIntent: handle');
      let { responseBuilder, requestEnvelope } = handlerInput;
      const currentIntent = requestEnvelope.request.intent;
  
      return responseBuilder
        .addDelegateDirective(currentIntent)
        .getResponse();
    },
  },
  CompletedDiscoverIntent: {
    canHandle(handlerInput) {
      logger.debug('CUSTOM.CompletedDiscoverIntent: canHandle');
      let {
        requestEnvelope
      } = handlerInput;
      return requestEnvelope.request.type === 'IntentRequest'
        && ((requestEnvelope.request.intent.name === 'CompleteDiscoverIntent' && requestEnvelope.request.dialogState === 'COMPLETED')
        || requestEnvelope.request.intent.name === 'DiscoverIntent');
    },
    async handle(handlerInput) {
      logger.debug('CUSTOM.CompletedDiscoverIntent: handle');
      
      let {
        attributesManager,
        requestEnvelope
      } = handlerInput;

      await Finder.discover(handlerInput);
      return handlerInput.responseBuilder.getResponse();
    }
  }
}

module.exports = customHandlers;