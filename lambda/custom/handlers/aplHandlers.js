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
                || requestEnvelope.request.arguments[0] === 'GoToItemScreenshots' || requestEnvelope.request.arguments[0] === 'GoToItemVideo' || requestEnvelope.request.arguments[0] === "GoToItemInfo"));
        },
        async handle(handlerInput) {
            let {
                requestEnvelope
            } = handlerInput;
            logger.debug('APL.NavigateToItem: handle: ' + requestEnvelope.request.arguments[0]);
            if(requestEnvelope.request.arguments[0] === 'GoToNextItem' || requestEnvelope.request.arguments[0] === 'GoToPrevItem') {
                Finder.getGameInfoFromOtherItem(handlerInput);
            } else if (requestEnvelope.request.arguments[0] === 'GoToItemScreenshots') {
                await Finder.changeGameInfoView(handlerInput, 0);
            } else if (requestEnvelope.request.arguments[0] === 'GoToItemVideo') {
                await Finder.changeGameInfoView(handlerInput, 2, true);
            } else if (requestEnvelope.request.arguments[0] === 'GoToItemInfo') {
                await Finder.changeGameInfoView(handlerInput, 1);
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
    StopVideo: {
        canHandle(handlerInput) {
            logger.debug('APL.StopVideo: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'StopVideo');
        },
        async handle(handlerInput) {
            logger.debug('APL.StopVideo: handle');
            Finder.stopVideo(handlerInput);
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
            Finder.reShowResults(handlerInput);
            return handlerInput.responseBuilder.getResponse();
        },
    }
}

module.exports = aplHandlers;