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
    NavigateToItem: {
        canHandle(handlerInput) {
            logger.debug('APL.NavigateToItem: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && (requestEnvelope.request.arguments[0] === 'GoToNextItem' || requestEnvelope.request.arguments[0] === 'GoToPrevItem'
                || requestEnvelope.request.arguments[0] === 'GoToItemScreenshots' || requestEnvelope.request.arguments[0] === 'GoToItemVideo'));
        },
        handle(handlerInput) {
            logger.debug('APL.NavigateToItem: handle');
            let {
                requestEnvelope
            } = handlerInput;
            if(requestEnvelope.request.arguments[0] === 'GoToNextItem' || requestEnvelope.request.arguments[0] === 'GoToPrevItem') {
                Finder.getGameInfoFromOtherItem(handlerInput);
            } else if (requestEnvelope.request.arguments[0] === 'GoToItemScreenshots') {
                Finder.changeGameInfoView(handlerInput, 0);
            } else if (requestEnvelope.request.arguments[0] === 'GoToItemVideo') {
                Finder.changeGameInfoView(handlerInput, 2);
                Finder.playVideo(handlerInput)
            }
            return handlerInput.responseBuilder.getResponse();
        },
    },
    ItemViewSelected: {
        canHandle(handlerInput) {
            logger.debug('APL.ItemViewSelected: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'ItemView');
        },
        handle(handlerInput) {
            logger.debug('APL.ItemViewSelected: handle');
            Finder.getGameInfoFromItemView(handlerInput);
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
        async handle(handlerInput) {
            logger.debug('APL.PlayVideo: handle');
            await Finder.playVideo(handlerInput);
            return handlerInput.responseBuilder.getResponse();
        },
    },
    VideoStoped: {
        canHandle(handlerInput) {
            logger.debug('APL.VideoStoped: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'StopVideo');
        },
        async handle(handlerInput) {
            logger.debug('APL.VideoStoped: handle');
            Finder.onVideoEnd(handlerInput);
            return handlerInput.responseBuilder.getResponse();
        },
    },
    GoBackToResults: {
        canHandle(handlerInput) {
            logger.debug('APL.GoBackToResults: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'GoBackToResults');
        },
        async handle(handlerInput) {
            logger.debug('APL.GoBackToResults: handle');
            Finder.showGeneralResults(handlerInput);
            return handlerInput.responseBuilder.getResponse();
        },
    }
}

module.exports = aplHandlers;