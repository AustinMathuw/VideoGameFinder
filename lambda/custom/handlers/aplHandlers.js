/*
 * File: aplHandlers.js
 * Description: File that handlers the APL events
 */

const logger = require('../utils/logger.js');
const Finder = require('../utils/finder.js');

const helpers = {
  
}

const aplHandlers = {
    SearchItemSelected: {
        canHandle(handlerInput) {
            logger.debug('APL.SearchItemSelected: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'SearchItem');
        },
        handle(handlerInput) {
            logger.debug('APL.SearchItemSelected: handle');
            Finder.getGameInfoFromSearchItem(handlerInput);
            return handlerInput.responseBuilder.getResponse();
        },
    },
    PlayVideo: {
        canHandle(handlerInput) {
            logger.debug('APL.PlayVideo: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'PlayVideo');
        },
        handle(handlerInput) {
            logger.debug('APL.PlayVideo: handle');
            Finder.playVideo(handlerInput);
            return handlerInput.responseBuilder.getResponse();
        },
    }
}

module.exports = aplHandlers;