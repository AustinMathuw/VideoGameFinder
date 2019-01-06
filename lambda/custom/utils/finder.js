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

class Params {
    constructor() {
      this.filterArray = [];
    }
  
    fields(fields) {
        if (fields) {
            let fieldsString =
                fields && fields.constructor === Array ? fields.join(",") : fields;
            fieldsString = fieldsString ? fieldsString.replace(/\s/g, "") : "";
            this.filterArray.push(`fields ${fieldsString}`);
        }
        return this;
    }
  
    sort(field, direction) {
        if (field) {
            this.filterArray.push(`sort ${field} ${direction || "asc"}`);
        }
        return this;
    }
  
    limit(limit) {
        if (limit) {
            this.filterArray.push(`limit ${limit}`);
        }
        return this;
    }
  
    offset(offset) {
        if (offset) {
            this.filterArray.push(`offset ${offset}`);
        }
        return this;
    }
  
    search(search) {
        if (search) {
            this.filterArray.push(`search ${search}`);
        }
        return this;
    }
  
    where(filters) {
        if (filters) {
            if (filters.constructor === Array) {
                this.filterArray.push(`where ${filters.join(" & ")}`);
            } else {
                this.filterArray.push(`where ${filters.trim()}`);
            }
        }
        return this;
    }

    getFormattedParams() {
        return this.filterArray ? this.filterArray.join(";") + ";" : "";
    }
};

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
      
        return slotValues;
    },
    getRating: function(ratingEnum) {
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
            case 6:
                return "RP";
            case 7:
                return "EC";
            case 8:
                return "E";
            case 9:
                return "E 10+";
            case 10:
                return "T";
            case 11:
                return "M";
            case 12:
                return "A";
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
                "skillLogo": "",
                "screenshotImageUrls": [],
                "backgroundImageUrl": "",
                "coverImageUrl": "",
                "infoText1": "",
                "infoText2": "",
                "infoText3": "",
                "infoText4": "",
                "summarySSML": "",
                "videoName": "",
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
                data.videoName = videoToShow.name;
                data.videoID = videoToShow.video_id;
            } else {
                data.videoName = element.game.videos[0].name;
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
            } else if(element.game.age_ratings[0] == null) {
                data.infoText2 = "ESRB N/A<br />PGEI " + helpers.getRating(element.game.age_ratings[1].rating);
            } else if(element.game.age_ratings[1] == null) {
                data.infoText2 = "ESRB " + helpers.getRating(element.game.age_ratings[0].rating) + "<br />PGEI N/A";
            } else {
                data.infoText2 = "ESRB " + helpers.getRating(element.game.age_ratings[0].rating) + "<br />PGEI " + helpers.getRating(element.game.age_ratings[1].rating);
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
            element.game.screenshots.forEach(screenshot => {
                data.screenshotImageUrls.push("https://images.igdb.com/igdb/image/upload/t_original/" + screenshot.image_id + ".jpeg");
            });
            
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
                    "game.total_rating"
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
                .limit(8);
        
            const data = queryParams.getFormattedParams();
            const url = settings.API_URL;
        
            axios({
                url: url,
                method: 'POST',
                timeout: settings.API_TIMEOUT,
                headers: {
                    'Accept': 'application/json',
                    'user-key': settings.API_KEY
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
            outputSpeech = ctx.t('SEARCH_RESULTS', {
                keyword: gameToSearch
            });
            if(display.isAPLCapatable(handlerInput)) {
                ctx.renderSearchResults(handlerInput, results, outputSpeech.pageTitle);
            }
            logger.debug(outputSpeech.speech);
            ctx.outputSpeech.push(outputSpeech.speech);
            ctx.reprompt.push(outputSpeech.reprompt);
            ctx.openMicrophone = true;
        }).catch(err => {
            outputSpeech = ctx.t('API_CALL_ERROR');
            logger.debug(err);
            ctx.outputSpeech.push(outputSpeech);
            ctx.openMicrophone = false;
        });
    },
    getGameInfoFromSearchItem: function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShow = requestEnvelope.request.arguments[1];
        var itemPosition = requestEnvelope.request.arguments[2];
        var commands = [
            {
                "type": "Parallel",
                "commands": [
                    {
                        "type": "ScrollToIndex",
                        "componentId": "entireDisplay",
                        "index": 1,
                        "align": "center"
                    },
                    {
                        "type": "ScrollToIndex",
                        "componentId": "resultsSequence",
                        "index": itemPosition - 1,
                        "align": "first"
                    },
                    {
                        "type": "ScrollToIndex",
                        "componentId": itemPosition,
                        "index": 1,
                        "align": "first"
                    },
                    {
                        "type": "Idle",
                        "delay": 3000
                    },
                    {
                        "type": "SpeakItem",
                        "componentId": itemPosition + "-summary",
                        "highlightMode": "line",
                        "align": "center"
                    }
                ]
            }
        ];
        var outputSpeech = ctx.t('SEARCH_RESULT_ITEM_INFO', {
            gameTitle: itemToShow.gameTitle
        });
        ctx.outputSpeech.push(outputSpeech.speech);
        ctx.reprompt.push(outputSpeech.reprompt);
        ctx.sendAPLCommands(handlerInput, commands, "token");
        ctx.openMicrophone = true;
    },
    getGameInfoFromOtherItem: function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShow = requestEnvelope.request.arguments[1];
        var itemPosition = requestEnvelope.request.arguments[2];
        var commands = [
            {
                "type": "Sequential",
                "commands": [
                    {
                        "type": "ScrollToIndex",
                        "componentId": "entireDisplay",
                        "index": 1,
                        "align": "center"
                    },
                    {
                        "type": "ScrollToIndex",
                        "componentId": "resultsSequence",
                        "index": itemPosition - 1,
                        "align": "first"
                    },
                    {
                        "type": "ScrollToIndex",
                        "componentId": itemPosition,
                        "index": 1,
                        "align": "first"
                    },
                    {
                        "type": "Sequential",
                        "commands": [
                            {
                                "type": "Idle",
                                "delay": 3000
                            },
                            {
                                "type": "SpeakItem",
                                "componentId": itemPosition + "-summary",
                                "highlightMode": "line",
                                "align": "center"
                            }
                        ]
                    }
                ]
            }
        ];
        var outputSpeech = ctx.t('SEARCH_RESULT_ITEM_INFO', {
            gameTitle: itemToShow.gameTitle
        });
        ctx.reprompt.push(outputSpeech.reprompt);
        ctx.sendAPLCommands(handlerInput, commands, "token");
        ctx.openMicrophone = true;
    },
    getGameInfoFromItemView: function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShow = requestEnvelope.request.arguments[1];
        var commands = [
            {
                "type": "Parallel",
                "commands": [
                    {
                        "type": "Idle",
                        "delay": 3000
                    },
                    {
                        "type": "SpeakItem",
                        "componentId": itemToShow.resultNum + "-summary",
                        "highlightMode": "line",
                        "align": "center"
                    }
                ]
            }
        ];

        ctx.sendAPLCommands(handlerInput, commands, "token");
        ctx.openMicrophone = true;
    },
    showGeneralResults: async function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var commands = [
            {
                "type": "ScrollToIndex",
                "componentId": "entireDisplay",
                "index": 0,
                "align": "center"
            }
                        
        ];
    
        var outputSpeech = ctx.t('RE_SHOW_RESULTS');
        ctx.outputSpeech.push(outputSpeech.speech);
        ctx.reprompt.push(outputSpeech.reprompt);
        ctx.sendAPLCommands(handlerInput, commands, "token");
        ctx.openMicrophone = true;
    },
    playVideo: async function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShowOn = requestEnvelope.request.arguments[1].videoID;
        var outputSpeech;
        await helpers.getVideoURL(itemToShowOn).then(videoURL => {
            var commands = [
                {
                    "type": "PlayMedia",
                    "componentId": itemToShowOn,
                    "source": videoURL
                }
            ];
            outputSpeech = "Playing video...";
            ctx.outputSpeech.push(outputSpeech);
            ctx.openMicrophone = false;
            ctx.sendAPLCommands(handlerInput, commands, "token");
        }).catch(err => {
            outputSpeech = ctx.t('API_CALL_ERROR');
            logger.debug(err);
            ctx.outputSpeech.push(outputSpeech);
            ctx.openMicrophone = false;
        })
    },
    onVideoEnd: function (handlerInput) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var result = requestEnvelope.request.arguments[1];
        var commands = [
            {
                "type": "ScrollToIndex",
                "componentId": result.resultNum,
                "index": 1,
                "align": "first"
              }
        ];
    
        var outputSpeech = ctx.t('VIDEO_END');
        ctx.outputSpeech.push(outputSpeech.speech);
        ctx.reprompt.push(outputSpeech.reprompt);
        ctx.sendAPLCommands(handlerInput, commands, "token");
        ctx.openMicrophone = true;
    },
    changeGameInfoView: function (handlerInput, index) {
        let {
            requestEnvelope,
            attributesManager
        } = handlerInput;
        let ctx = attributesManager.getRequestAttributes();
        var itemToShow = requestEnvelope.request.arguments[1];
        var commands = [
            {
                "type": "ScrollToIndex",
                "componentId": itemToShow.resultNum,
                "index": index,
                "align": "first"
            }
        ];

        ctx.sendAPLCommands(handlerInput, commands, "token");
        ctx.openMicrophone = true;
    }
};
module.exports = Finder;