/*
 * File: finder.js
 * Description: This file contains most of the game logic, while the actual intent & event request
 *    handler can be found in the gamePlayHandlers.js file.
 */

'use strict';
var logger = require('../utils/logger.js');
var settings = require('../config/settings.js');
var display = require('../utils/display.js');
var axios = require('axios');
const moment = require('moment');
const Params = require('../utils/paramsBuilder.js');
const ParamsMap = require('../utils/paramsMapper.js');



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
    },
    getRating: function(ratingEnum, isESRB) {
        if(isESRB) {
            switch(ratingEnum){
                case 1:
                    return "RP";
                case 2:
                    return "EC";
                case 3:
                    return "E";
                case 4:
                    return "E 10+";
                case 5:
                    return "T";
                case 6:
                    return "M";
                case 7:
                    return "A";
            }
        } else {
            switch(ratingEnum){
                case 1:
                    return "3";
                case 2:
                    return "7";
                case 3:
                    return "12";
                case 4:
                    return "16";
                case 5:
                    return "18";
            }
        }
    },
    getVideoURL: function(videoID) {
        //see https://gist.github.com/el3zahaby/9e60f1ae3168c38cc0f0054c15cd6a83#httpsyou-linkherokuappcomurlhttpswwwyoutubecomwatchvid
        return new Promise((resolve, reject) => {
            axios({
                url: settings.VIDEO_CONVERTER_URL + videoID,
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    var results = response.data[0];
                    if(results == null) {
                        resolve(null);
                    } else {
                        resolve(results.url);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    buildPayload: function(incomingData) {
        var results = [];
        var resultNum = 1;
        incomingData.forEach(element => {
            console.log(element.game.name);
            var data = {
                "gameTitle": "",
                "resultNum": resultNum,
                "resultTotal": incomingData.length,
                "screenshotImageUrls": [],
                "backgroundImageUrl": "",
                "coverImageUrl": "",
                "infoText1": "",
                "infoText2": "",
                "infoText3": "",
                "infoText4": "",
                "summarySSML": "",
                "videoID": ""
            };
            var videoToShow = element.game.videos.find(video => {
                if(settings.VIDEO_NAME == video.name){
                    return true;
                } else  {
                    return false;
                }
            });
            if(videoToShow){
                data.videoID = videoToShow.video_id;
            } else {
                data.videoID = element.game.videos[0].video_id;
            }

            resultNum++;
            data.backgroundImageUrl = "https://s3.amazonaws.com/austinmatthuw/WhatsThatSong/resources/background.jpg";
            data.coverImageUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/" + element.game.cover.image_id + ".jpeg";
            data.gameTitle = element.game.name;
    
            //Get Release Date
            var releaseDate = new Date(0);
            releaseDate.setUTCSeconds(element.game.first_release_date);
            data.infoText1 = moment(releaseDate).format('MMMM Do YYYY');
    
            //Get Ratings
            if(element.game.age_ratings == null) {
                data.infoText2 = "N/A";
            } else {
                var ESRB = "N/A"
                var PEGI = "N/A"
                element.game.age_ratings.forEach(rating => {
                    if(rating.category == 1) {
                        ESRB = helpers.getRating(rating.rating, true);
                    } else {
                        PEGI = helpers.getRating(rating.rating, false);
                    }
                });
                data.infoText2 = "ESRB " + ESRB + "<br />PEGI " + PEGI;
            }
    
            //Get Ratings
            if(element.game.total_rating == null) {
                data.infoText3 = "N/A";
            } else {
                data.infoText3 = element.game.total_rating.toFixed(2);
            }
    
            //Get most known involved company
            if(element.game.involved_companies == null) {
                data.infoText4 = "N/A";
            } else {
                var mostInvolved = element.game.involved_companies[0];
                element.game.involved_companies.forEach(company => {
                    if(company.company.id < mostInvolved.company.id){
                        mostInvolved = company;
                    }
                });
                data.infoText4 = mostInvolved.company.name;
            }
            //data.screenshotImageUrls.push("https://images.igdb.com/igdb/image/upload/t_original/" + element.game.screenshots[0].image_id + ".jpeg");
            element.game.screenshots.forEach(screenshot => {
                data.screenshotImageUrls.push("https://images.igdb.com/igdb/image/upload/t_original/" + screenshot.image_id + ".jpeg");
            });
            data.screenshotImageUrls = data.screenshotImageUrls.slice(0, 9);
            
            data.skillLogo = "";
            if(element.game.summary.indexOf("\n") > -1){
                data.summarySSML = "<speak>" + element.game.summary.substring(0, element.game.summary.indexOf("\n")) + "</speak>";
            } else {
                data.summarySSML = "<speak>" + element.game.summary + "</speak>";
            }
            results.push(data);
        });
        return results;
    },
    buildDiscoveryParams: function(slotValues) {   
        let params = [];
        for(var index in slotValues){
            var findRating = (index == "ageRating");
            if(slotValues[index] && slotValues[index].resolved && ParamsMap.encode[index]) {
                console.log(index);
                params.push(ParamsMap.encode.filterType[index].replace("{{value}}", ParamsMap.encode[index][slotValues[index].resolved]));
                if(findRating) {
                    var cat = "esrb"
                    if(slotValues[index].resolved.indexOf("pegi") > -1) {
                        cat = "pegi";
                    }
                    params.push(ParamsMap.encode.filterType["ageRatingCategory"].replace("{{value}}", ParamsMap.encode["ageRatingCategory"][cat]));
                }
            } else if(slotValues[index] && slotValues[index].resolved) {
                console.log(index);
                params.push(ParamsMap.encode.filterType[index].replace("{{value}}", slotValues[index].resolved));
            } else {
                console.log(index + " not requested in discovery."); //Should only hit in incomplete discovery
            }
        }
        return params;
    },
    search: async function(itemToSearch) {
        return new Promise((resolve, reject) => {
            var queryParams = new Params();
            queryParams
                .fields([
                    "game.involved_companies.company.name",
                    "game.age_ratings.rating",
                    "game.age_ratings.rating_cover_url",
                    "game.name",
                    "game.first_release_date",
                    "game.platforms.name",
                    "game.screenshots.image_id",
                    "game.similar_games",
                    "game.summary",
                    "game.cover.image_id",
                    "game.videos.name",
                    "game.videos.video_id",
                    "game.total_rating",
                    "game.age_ratings.category"
                ])
                .search('"' + itemToSearch + '"')
                .where([
                    "game != null",
                    "game.version_parent = null",
                    "game.category = 0",
                    "game.cover != null",
                    "game.screenshots != null",
                    "game.videos != null"
                ])
                .limit(settings.API.RESULTS_LIMIT);
        
            const data = queryParams.getFormattedParams();
            const url = settings.API.URL;
        
            axios({
                url: url,
                method: 'POST',
                timeout: settings.API.TIMEOUT,
                headers: {
                    'Accept': 'application/json',
                    'user-key': settings.API.KEY
                },
                data: data
            })
                .then(response => {
                    var results = helpers.buildPayload(response.data);
                    resolve(results);
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    discover: async function(slotValues) {
        return new Promise((resolve, reject) => {
            var discoverFilters = helpers.buildDiscoveryParams(slotValues);
            var defaultFilters = [
                "game != null",
                "game.version_parent = null",
                "game.category = 0",
                "game.cover != null",
                "game.screenshots != null",
                "game.videos != null"
            ];
            var filters =  defaultFilters.concat(discoverFilters);
            var queryParams = new Params();
            queryParams
                .fields([
                    "game.involved_companies.company.name",
                    "game.age_ratings.rating",
                    "game.age_ratings.rating_cover_url",
                    "game.name",
                    "game.first_release_date",
                    "game.platforms.name",
                    "game.screenshots.image_id",
                    "game.similar_games",
                    "game.summary",
                    "game.cover.image_id",
                    "game.videos.name",
                    "game.videos.video_id",
                    "game.total_rating",
                    "game.age_ratings.category"
                ])
                .where(filters)
                .sort("popularity", "desc")
                .limit(settings.API.RESULTS_LIMIT);
        
            const data = queryParams.getFormattedParams();
            const url = settings.API.URL;
        
            axios({
                url: url,
                method: 'POST',
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'user-key': settings.API.KEY
                },
                data: data
            })
                .then(response => {
                    var results = helpers.buildPayload(response.data);
                    resolve(results);
                })
                .catch(err => {
                    if (err.response) {
                        console.log(err.response.data);
                        console.log(err.response.status);
                        console.log(err.response.headers);
                        if(err.response.data && err.response.status == 500) {
                            var response = JSON.stringify(err.response.data);
                            response = response.substring(0, response.indexOf("][") + 1) + "\"";
                            response = JSON.parse(JSON.parse(response));
                            var results = helpers.buildPayload(response);
                            resolve(results);
                        }
                    }
                    reject(err);
                });
        });
    }
}

const Finder = {
    search: async function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        
        let ctx = attributesManager.getRequestAttributes();

        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = helpers.getSlotValues(filledSlots);

        var outputSpeech = "";
        logger.debug(slotValues.videogame.resolved);
        var gameToSearch = slotValues.videogame.resolved;

        await helpers.search(gameToSearch).then(results => {
            if(!(results.length > -1)) {
                let responseMessage = ctx.t('NO_SEARCH_RESULTS');
                if(display.isAPLCapatable(handlerInput)) {
                    ctx.renderDefault(handlerInput, responseMessage);
                }
                ctx.outputSpeech.push(responseMessage.outputSpeech);
                ctx.reprompt.push(responseMessage.reprompt);
                ctx.openMicrophone = true;
                return;
            }
            outputSpeech = ctx.t('SEARCH_RESULTS', {
                keyword: gameToSearch
            });
            sessionAttributes.state = settings.SKILL_STATES.GENERAL_RESULTS_STATE;
            sessionAttributes.currentItem = 0;
            sessionAttributes.lastItem = results.length;
            sessionAttributes.results = results;
            sessionAttributes.gameToSearch = gameToSearch;
            if(ctx.isAPLCapatable(handlerInput)) {
                var resultsToDisplay = [];
                results.forEach(result => {
                    resultsToDisplay.push({
                        "gameTitle": result.gameTitle,
                        "resultNum": result.resultNum,
                        "coverImageUrl": result.coverImageUrl,
                        "infoText1": result.infoText1
                    });
                });
                ctx.renderSearchResultsOverall(handlerInput, resultsToDisplay, outputSpeech.pageTitleSearch, gameToSearch);
                ctx.outputSpeech.push(outputSpeech.speechWithDisplay);
                ctx.openMicrophone = false;
            } else {
                ctx.outputSpeech.push(outputSpeech.speech);
                var cardContent = "";
                var index = 1;
                results.forEach(result => {
                    cardContent = cardContent + index + ": " + result.gameTitle + "\n";
                    index++;
                });
                ctx.setCard(false, outputSpeech.cardTitleSearch, cardContent);
                ctx.openMicrophone = false;
            }
        }).catch(err => {
            outputSpeech = ctx.t('API_CALL_ERROR');
            logger.debug(err);
            ctx.outputSpeech.push(outputSpeech);
            ctx.openMicrophone = false;
        });
    },
    discover: async function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        sessionAttributes.state = settings.SKILL_STATES.GENERAL_RESULTS_STATE;

        let ctx = attributesManager.getRequestAttributes();

        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = helpers.getSlotValues(filledSlots);

        var outputSpeech = "";
        var gameToSearch = "discoverGamePlaceholder";

        await helpers.discover(slotValues).then(results => {
            if(!(results.length > -1)) {
                let responseMessage = ctx.t('NO_SEARCH_RESULTS');
                if(display.isAPLCapatable(handlerInput)) {
                    ctx.renderDefault(handlerInput, responseMessage);
                }
                ctx.outputSpeech.push(responseMessage.outputSpeech);
                ctx.reprompt.push(responseMessage.reprompt);
                ctx.openMicrophone = true;
                return;
            }
            outputSpeech = ctx.t('SEARCH_RESULTS', {
                keyword: gameToSearch
            });
            sessionAttributes.state = settings.SKILL_STATES.GENERAL_RESULTS_STATE;
            sessionAttributes.currentItem = 0;
            sessionAttributes.lastItem = results.length;
            sessionAttributes.results = results;
            sessionAttributes.gameToSearch = gameToSearch;
            if(ctx.isAPLCapatable(handlerInput)) {
                var resultsToDisplay = [];
                results.forEach(result => {
                    resultsToDisplay.push({
                        "gameTitle": result.gameTitle,
                        "resultNum": result.resultNum,
                        "coverImageUrl": result.coverImageUrl,
                        "infoText1": result.infoText1
                    });
                });
                ctx.renderSearchResultsOverall(handlerInput, resultsToDisplay, outputSpeech.pageTitleDiscover, gameToSearch);
                ctx.outputSpeech.push(outputSpeech.speechWithDisplay);
            } else {
                ctx.outputSpeech.push(outputSpeech.speech);
                var cardContent = "";
                var index = 1;
                results.forEach(result => {
                    cardContent = cardContent + index + ": " + result.gameTitle + "\n";
                    index++;
                });
                ctx.setCard(false, outputSpeech.cardTitleDiscover, cardContent);
                ctx.openMicrophone = false;
            }
            ctx.reprompt.push(outputSpeech.reprompt);
            ctx.openMicrophone = false;
        }).catch(err => {
            outputSpeech = ctx.t('API_CALL_ERROR');
            logger.debug(err);
            ctx.outputSpeech.push(outputSpeech);
            ctx.openMicrophone = false;
        });
    },
    getGameInfoFromSearchItem: function (handlerInput, itemPosition, results) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        sessionAttributes.state = settings.SKILL_STATES.DETAILED_RESULTS_STATE;
        logger.debug(itemPosition);

        let ctx = attributesManager.getRequestAttributes();
        var commands = [
            {
                "type": "Sequential",
                "commands": [
                    {
                        "type": "SpeakItem",
                        "componentId": itemPosition + "-summary",
                        "highlightMode": "line",
                        "align": "center"
                    }
                ]
            }
        ];
        
        sessionAttributes.currentItem = parseInt(itemPosition);
        var outputSpeech = ctx.t('GENERAL_REPROMPT');
        if(ctx.isAPLCapatable(handlerInput)) {
            ctx.renderSearchResultsInfo(handlerInput, results[itemPosition - 1]);
            ctx.addAPLCommands(commands);
            outputSpeech = ctx.t('GENERAL_REPROMPT', {
                gameTitle: results[itemPosition - 1].gameTitle
            });
            ctx.reprompt.push(outputSpeech.reprompt);
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.openMicrophone = true;
        } else {
            outputSpeech = ctx.t('NO_DISPLAY');
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.openMicrophone = false;
        }
        
    },
    getGameInfoFromOtherItem: function (handlerInput, itemPosition, results) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        
        var commands = [
            {
                "type": "Sequential",
                "commands": [
                    {
                        "type": "SpeakItem",
                        "componentId": itemPosition + "-summary",
                        "highlightMode": "line",
                        "align": "center"
                    }
                ]
            }
        ];
        var outputSpeech = ctx.t('SEARCH_RESULT_ITEM_INFO');
        if(ctx.isAPLCapatable(handlerInput)) {
            ctx.renderSearchResultsInfo(handlerInput, results[itemPosition - 1]);
            ctx.addAPLCommands(commands);
            ctx.reprompt.push(outputSpeech.reprompt);
            ctx.openMicrophone = false;
        } else {
            outputSpeech = ctx.t('NO_DISPLAY');
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.openMicrophone = false;
        }
    },
    getGameInfoFromItemView: function (handlerInput, itemPosition) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var commands = [
            {
                "type": "SpeakItem",
                "componentId": itemPosition + "-summary",
                "highlightMode": "line",
                "align": "center"
            }
        ];

        var outputSpeech = ctx.t('GENERAL_REPROMPT');
        if(ctx.isAPLCapatable(handlerInput)) {
            ctx.addAPLCommands(commands);
            ctx.reprompt.push(outputSpeech.reprompt);
            ctx.openMicrophone = false;
        } else {
            outputSpeech = ctx.t('NO_DISPLAY');
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.openMicrophone = false;
        }
    },
    reShowResults: async function (handlerInput, gameToSearch, results) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        sessionAttributes.state = settings.SKILL_STATES.GENERAL_RESULTS_STATE;

        var outputSpeech = ctx.t('RE_SHOW_RESULTS', {
            keyword: gameToSearch
        });
        if(ctx.isAPLCapatable(handlerInput)) {
            if(gameToSearch == "discoverGamePlaceholder") {
                ctx.renderSearchResultsOverall(handlerInput, results, outputSpeech.pageTitleDiscover, gameToSearch);
            } else {
                ctx.renderSearchResultsOverall(handlerInput, results, outputSpeech.pageTitleSearch, gameToSearch);
            }
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.reprompt.push(outputSpeech.reprompt);
            ctx.openMicrophone = false;
        } else {
            outputSpeech = ctx.t('NO_DISPLAY');
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.openMicrophone = false;
        }
    },
    playVideo: async function (handlerInput, result) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShowOn = result.videoID;
        var outputSpeech;
        await helpers.getVideoURL(itemToShowOn).then(videoURL => {
            logger.log(itemToShowOn);
            logger.log(videoURL);
            var commands = [
                {
                    "type": "PlayMedia",
                    "componentId": itemToShowOn,
                    "source": videoURL
                }
            ];
            ctx.addAPLCommands(commands);
            ctx.openMicrophone = false;
        }).catch(err => {
            outputSpeech = ctx.t('API_CALL_ERROR');
            logger.debug(err);
            ctx.outputSpeech.push(outputSpeech);
            ctx.openMicrophone = false;
        })
    },
    stopVideo: async function (handlerInput, result) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShowOn = result.videoID;
        var commands = [
            {
                "type": "ControlMedia",
                "componentId": itemToShowOn,
                "command": "pause"
            }  
        ];
        ctx.addAPLCommands(commands);
        ctx.openMicrophone = false;
    },
    changeGameInfoView: async function (handlerInput, index, result, playVideo = false) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        var commands = [
            {
                "type": "SetPage",
                "componentId": result.resultNum,
                "value": index
            },
            {
                "type": "SetPage",
                "componentId": result.resultNum + "-Screenshots-Pager",
                "value": 0
            }
        ];

        if(index == 0){
            commands.push({
                "type": "AutoPage",
                "componentId": result.resultNum + "-Screenshots-Pager",
                "duration": 5000
            });
        }

        ctx.addAPLCommands(commands);

        var outputSpeech;
        if(ctx.isAPLCapatable(handlerInput)) {
            outputSpeech = ctx.t('GENERAL_REPROMPT');
            ctx.reprompt.push(outputSpeech.reprompt);

            if(playVideo) {
                await Finder.playVideo(handlerInput, result);
            } else {
                await Finder.stopVideo(handlerInput, result);
            }
            ctx.openMicrophone = false;
        } else {
            outputSpeech = ctx.t('NO_DISPLAY');
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.openMicrophone = false;
        }
    },
    invalidInteraction: function(handlerInput, type) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var outputSpeech = ctx.t('INVALID_INTERACTION');
        ctx.outputSpeech.push(outputSpeech[type]);
        var repromptSpeech = ctx.t('GENERAL_REPROMPT');
        ctx.reprompt.push(repromptSpeech.reprompt);
        ctx.openMicrophone = true;
    }
};
module.exports = Finder;