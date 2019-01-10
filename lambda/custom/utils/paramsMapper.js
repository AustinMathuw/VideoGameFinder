// https://api-docs.igdb.com/?javascript#filters
module.exports = {
    "encode": {
        "filterType": {
            "platform": "game.platforms = ({{value}})", //
            "genre": "game.genres = ({{value}})",
            "theme": "game.themes = ({{value}})",
            "gamemode": "game.game_modes = ({{value}})",
            "perspective": "game.player_perspectives = ({{value}})",
            "ageRating": "game.age_ratings.rating = {{value}}",
            "ageRatingCategory": "game.age_ratings.category = ({{value}})",
            "rating": "game.total_rating >= {{value}}"
        },
        "platform": {
            "linux": 3,
            "mac": 14,
            "pc": 6,
            "nitendo switch": 130,
            "playstation four": 48,
            "xbox one": 49,
            "xbox three sixty": 12,
            "playstation three": 9
        },
        "genre": {
            "point and click": 2,
            "fighting": 4,
            "shooter": 5,
            "music": 7,
            "platform": 8,
            "puzzle": 9,
            "racing": 10,
            "real time strategy": 11,
            "role playing": 12,
            "simulator": 13,
            "sport": 14,
            "strategy": 15,
            "turn based strategy": 16,
            "tactical": 24,
            "hack and slash": 25,
            "trivia": 26,
            "pinball": 30,
            "adventure": 31,
            "indie": 32,
            "arcade": 33
        },
        "theme": {
            "action": 1,
            "fantasy": 17,
            "science fiction": 18,
            "horror": 19,
            "thriller": 20,
            "survival": 21,
            "historical": 22,
            "stealth": 23,
            "comedy": 27,
            "business": 28,
            "drama": 31,
            "non fiction": 32,
            "sandbox": 33,
            "educational": 34,
            "kids": 35,
            "open world": 38,
            "warfare": 39,
            "party": 40,
            "erotic": 42,
            "mystery": 43
        },
        "gamemode": {
            "co-operative": 3,
            "massively muiltiplayer": 5,
            "multiplayer": 2,
            "single player": 1,
            "split screen": 4
        },
        "perspective": {
            "aural": 6,
            "bird view": 3,
            "first person": 1,
            "side view": 4,
            "text": 5,
            "third person": 2,
            "virtual reality": 7
        },
        "ageRating": {
            "pegi 3": 1,
            "pegi 7": 2,
            "pegi 12": 3,
            "pegi 16": 4,
            "pegi 18": 5,
            "rating pending": 1,
            "early childhood": 2,
            "everyone": 3,
            "everyone ten and up": 4,
            "teen": 5,
            "mature": 6,
            "adults only": 7
        },
        "ageRatingCategory": {
            "esrb": 1,
            "pegi": 2
        }
    }
};