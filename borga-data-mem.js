'use strict'

const errors = require('./borga-errors.js');
const users = {groups: {}}
const gameCollection = {games: {}}


async function addGameToCollection(game){
    gameCollection.games[game.name] = game
    return true 
}

async function getGame(gameName){
    return gameCollection.games[gameName]
}

async function hasGame(gameName){         
    return !!gameCollection.games[gameName]
}

async function createNewGroup(groupName, groupDescription){
    // Erro se o grupo já existir TODO #1
    users.groups[groupName] = {
                name: groupName, 
                description: groupDescription,
                gameNames: []
            }
    
    return users.groups
}

async function getGroups(){
    return users.groups
}

async function editGroup(groupName, givenName, newDescription){
    const desc = newDescription ? newDescription : users.groups[groupName].description 
    const newName = givenName ? givenName : groupName   
    users.groups[newName] = {
        name: newName,
        description: desc,
        gameNames: users.groups[groupName].gameNames
    }
    delete users.groups[groupName]
    return users.groups  
}

//Não dar add a um jogo que já existe no grupo TODO #2
async function addGameToGroup(groupName, gameToAdd){
    users.groups[groupName].gameNames.push(gameToAdd)
    return true
}


async function groupDetails(groupName){
     return users.groups[groupName]
}

async function deleteGroup(groupName){
    delete users.groups[groupName]
    return true
}

async function deleteGameByName(groupName, gameName){
    const gameArray = users.groups[groupName].gameNames
    users.groups[groupName].gameNames = gameArray.filter(name => gameName !== name)
    return true
}

module.exports = {
    createNewGroup: createNewGroup,
    getGroups: getGroups,
    editGroup: editGroup,
    groupDetails: groupDetails,
    deleteGroup: deleteGroup,
    hasGame: hasGame,
    getGame: getGame,
    addGameToCollection: addGameToCollection,
    addGameToGroup: addGameToGroup,
    deleteGameByName, deleteGameByName
}