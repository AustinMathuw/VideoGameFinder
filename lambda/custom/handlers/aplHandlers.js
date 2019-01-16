/*
 * File: aplHandlers.js
 * Description: File that handlers the APL events
 */

const logger = require('../utils/logger.js');
const Finder = require('../utils/finder.js');
const settings = require('../config/settings');

const helpers = {
    getSlotValues: function(filledSlots) {
        const slotValues = {};
      
        console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
        Object.keys(filledSlots).forEach((item) => {
          const name = filledSlots[item].name;
      
          if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
              case 'ER_SUCCESS_MATCH':
                slotValues[name] = {
                  synonym: filledSlots[item].value,
                  resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                  isValidated: true,
                };
                break;
              case 'ER_SUCCESS_NO_MATCH':
                slotValues[name] = {
                  synonym: filledSlots[item].value,
                  resolved: filledSlots[item].value,
                  isValidated: false,
                };
                break;
              default:
                break;
            }
          } else {
            slotValues[name] = {
              synonym: filledSlots[item].value,
              resolved: filledSlots[item].value,
              isValidated: false,
            };
          }
        }, this);
        console.log(`The formatted slots: ${JSON.stringify(slotValues)}`);
        return slotValues;
    }
}

const aplHandlers = {
    SearchItemSelected: {
        canHandle(handlerInput) {
            logger.debug('APL.SearchItemSelected: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return (requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
                && requestEnvelope.request.arguments[0] === 'SearchItem')
                || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.SelectIntent');
        },
        handle(handlerInput) {
            let {
                attributesManager,
                requestEnvelope
            } = handlerInput;
            let sessionAttributes = attributesManager.getSessionAttributes();
            console.log(sessionAttributes.state);
            console.log(settings.SKILL_STATES.GENERAL_RESULTS_STATE);
            if(sessionAttributes.state != settings.SKILL_STATES.GENERAL_RESULTS_STATE){
                Finder.invalidInteraction(handlerInput, settings.SKILL_INTERACTIONS.SELECT_ITEM)
                return handlerInput.responseBuilder.getResponse();
            }
            logger.debug('APL.SearchItemSelected: handle');

            var itemPosition;
            var gameToSearch;
            var results;

            if(requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent') {
                itemPosition = requestEnvelope.request.arguments[1];
                gameToSearch = requestEnvelope.request.arguments[2];
                results = requestEnvelope.request.arguments.slice(3);
            } else {
                const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
                const slotValues = helpers.getSlotValues(filledSlots);
                results = [];
                gameToSearch = sessionAttributes.gameToSearch;
                if(slotValues.ListPosition.value) {
                    itemPosition = slotValues.ListPosition.value;
                } else if (slotValues.ListPosition.value) {
                    if(slotValues.ListPosition.value == "top") {
                        itemPosition = 1;
                    } else if(slotValues.PositionRelation.value == ("bottom" || "last")) {
                        itemPosition = sessionAttributes.lastItem;
                    } else {
                        itemPosition = 1;
                    }
                } else {
                    itemPosition = 1;
                }
            }
            Finder.getGameInfoFromSearchItem(handlerInput, itemPosition, gameToSearch, results);
            return handlerInput.responseBuilder.getResponse();
        },
    },
    InProgressNavigateToItem: {
        canHandle(handlerInput) {
            logger.debug('CUSTOM.InProgressNavigateToItem: canHandle');
            let {
                requestEnvelope
            } = handlerInput;
            return requestEnvelope.request.type === 'IntentRequest'
                && requestEnvelope.request.intent.name === 'NavigateDetailsIntent'
                && requestEnvelope.request.dialogState !== 'COMPLETED';
        },
        handle(handlerInput) {
            logger.debug('CUSTOM.InProgressNavigateToItem: handle');
            let { responseBuilder, requestEnvelope } = handlerInput;
            const currentIntent = requestEnvelope.request.intent;
        
            return responseBuilder
                .addDelegateDirective(currentIntent)
                .getResponse();
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
                || requestEnvelope.request.arguments[0] === 'GoToItemScreenshots' || requestEnvelope.request.arguments[0] === 'GoToItemVideo' || requestEnvelope.request.arguments[0] === "GoToItemInfo"))
                || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && ((handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent' || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent')
                //|| (handlerInput.requestEnvelope.request.intent.name === 'ScreenshotsIntent' || handlerInput.requestEnvelope.request.intent.name === 'VideoIntent' || handlerInput.requestEnvelope.request.intent.name === 'ItemInfoIntent'))
                || (handlerInput.requestEnvelope.request.intent.name === 'NavigateDetailsIntent' && requestEnvelope.request.dialogState === 'COMPLETED')));
        },
        async handle(handlerInput) {
            let {
                attributesManager,
                requestEnvelope
            } = handlerInput;
            let sessionAttributes = attributesManager.getSessionAttributes();
            if(sessionAttributes.state != settings.SKILL_STATES.DETAILED_RESULTS_STATE){
                Finder.invalidInteraction(handlerInput, settings.SKILL_INTERACTIONS.NAVIGATE_TO_ITEM)
                return handlerInput.responseBuilder.getResponse();
            }
            
            if(requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent') {
                logger.debug('APL.NavigateToItem tap: handle: ' + requestEnvelope.request.arguments[0]);
                if(requestEnvelope.request.arguments[0] === 'GoToNextItem' || requestEnvelope.request.arguments[0] === 'GoToPrevItem') {
                    Finder.getGameInfoFromOtherItem(handlerInput, requestEnvelope.request.arguments[2]);
                } else if (requestEnvelope.request.arguments[0] === 'GoToItemScreenshots') {
                    await Finder.changeGameInfoView(handlerInput, 0, requestEnvelope.request.arguments[1].resultNum);
                } else if (requestEnvelope.request.arguments[0] === 'GoToItemVideo') {
                    await Finder.changeGameInfoView(handlerInput, 2, requestEnvelope.request.arguments[1].resultNum, true);
                } else if (requestEnvelope.request.arguments[0] === 'GoToItemInfo') {
                    await Finder.changeGameInfoView(handlerInput, 1, requestEnvelope.request.arguments[1].resultNum);
                }
            } else {
                logger.debug('APL.NavigateToItem no tap: handle: ' + sessionAttributes.item);
                if(handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent') {
                    Finder.getGameInfoFromOtherItem(handlerInput, sessionAttributes.currentItem + 1);
                } else if(handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent') {
                    Finder.getGameInfoFromOtherItem(handlerInput, sessionAttributes.currentItem - 1);
                } else if (handlerInput.requestEnvelope.request.intent.name === 'NavigateDetailsIntent') {
                    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
                    const slotValues = helpers.getSlotValues(filledSlots);
                    if(slotValues.ListPosition.resolved === 'screenshots') {
                        await Finder.changeGameInfoView(handlerInput, 0, sessionAttributes.currentItem);
                    } else if (slotValues.ListPosition.resolved === 'video') {
                        await Finder.changeGameInfoView(handlerInput, 2, sessionAttributes.currentItem, true);
                    } else if (slotValues.ListPosition.resolved === 'summary') {
                        await Finder.changeGameInfoView(handlerInput, 1, sessionAttributes.currentItem);
                    }
                }
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
                && requestEnvelope.request.arguments[0] === 'ItemView')
                || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'ReadTextIntent');
        },
        handle(handlerInput) {
            let {
                attributesManager,
                requestEnvelope
            } = handlerInput;
            let sessionAttributes = attributesManager.getSessionAttributes();
            if(sessionAttributes.state != settings.SKILL_STATES.DETAILED_RESULTS_STATE){
                Finder.invalidInteraction(handlerInput, settings.SKILL_INTERACTIONS.READ_TEXT)
                return handlerInput.responseBuilder.getResponse();
            }
            logger.debug('APL.ItemViewSelected: handle');
            var itemPosition = 0;
            if(requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent') {
                itemPosition = requestEnvelope.request.arguments[1]
            } else {
                itemPosition = sessionAttributes.currentItem;
            }
            Finder.getGameInfoFromItemView(handlerInput, itemPosition);
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
            let {
                attributesManager,
                requestEnvelope
            } = handlerInput;
            let sessionAttributes = attributesManager.getSessionAttributes();
            if(sessionAttributes.state != settings.SKILL_STATES.DETAILED_RESULTS_STATE){
                Finder.invalidInteraction(handlerInput, settings.SKILL_INTERACTIONS.PLAY_VIDEO)
                return handlerInput.responseBuilder.getResponse();
            }
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
            let {
                attributesManager,
                requestEnvelope
            } = handlerInput;
            let sessionAttributes = attributesManager.getSessionAttributes();
            if(sessionAttributes.state != settings.SKILL_STATES.DETAILED_RESULTS_STATE){
                Finder.invalidInteraction(handlerInput, settings.SKILL_INTERACTIONS.STOP_VIDEO)
                return handlerInput.responseBuilder.getResponse();
            }
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
                && requestEnvelope.request.arguments[0] === 'GoBackToResults')
                || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'ShowResultsIntent');
        },
        async handle(handlerInput) {
            let {
                attributesManager,
                requestEnvelope
            } = handlerInput;
            let sessionAttributes = attributesManager.getSessionAttributes();
            if(sessionAttributes.state != settings.SKILL_STATES.DETAILED_RESULTS_STATE){
                Finder.invalidInteraction(handlerInput, settings.SKILL_INTERACTIONS.GO_BACK)
                return handlerInput.responseBuilder.getResponse();
            }
            logger.debug('APL.GoBackToResults: handle');

            var gameToSearch;
            var results;

            if(requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent') {
                gameToSearch = requestEnvelope.request.arguments[1];
                results = requestEnvelope.request.arguments.slice(2);
            } else {
                gameToSearch = sessionAttributes.gameToSearch;
                results = [];
            }

            Finder.reShowResults(handlerInput, gameToSearch, results);
            return handlerInput.responseBuilder.getResponse();
        },
    }
}

module.exports = aplHandlers;