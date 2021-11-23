/*'use strict'

const errors = require('./borga-errors');

const games = {};

const hasGame = async(gameId) => !!games[gameId];

async function saveGame(gameObj){
    const gamesId = gamesObj.id
    games[gamesId] = gamesObj
    return gamesId 
}

async function loadGame(gameId){
    const gameObj = games[gameId]
    if(!gamesObj) {
        const err = errors.NOT_FOUND({id: gameId})
        throw err
    }
    return gamesObj
}

async function deleteGame(gameId){
    const gamesId = game[gamesId]
    if(!gameObj){
        throw errors.NOT_FOUND({id: gamesId})
    }
    delete games[gamesId]
    return gamesId
}

async function listGames(){
    return Object.values(games)
}

module.exports = {
    hasGame,
    saveGame,
    loadGame,
    deleteGame,
    listGames
}*/