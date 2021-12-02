'use strict'

const errors = require('./borga-errors.js');
const users = {}
const tokens = {}
const gameCollection = {games: {}}

/**
 * Novo
 */
async function createNewUser(name){
    tokens[crypto.randomUUID()] = name
    users[name][groups] = {}
}

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

/**
 * username adicionado
 */
async function createNewGroup(groupName, groupDescription, userName){
    // Erro se o grupo já existir TODO #1
    users[userName].groups[groupName] = {
                name: groupName, 
                description: groupDescription,
                gameNames: []
            }
    
    return users[userName].groups
}

/**
 * username adicionado
 */
async function getGroups(userName){
    return users[userName].groups
}

/**
 * username adicionado
 */
async function editGroup(groupName, givenName, newDescription, userName){
    const userToEdit = users[userName]
    const desc = newDescription ? newDescription : userToEdit.groups[groupName].description 
    const newName = givenName ? givenName : groupName   
    userToEdit.groups[newName] = {
        name: newName,
        description: desc,
        gameNames: userToEdit.groups[groupName].gameNames
    }
    delete userToEdit.groups[groupName]
    return userToEdit.groups  
}

//Não dar add a um jogo que já existe no grupo TODO #2
async function addGameToGroup(groupName, gameToAdd){
    users.groups[groupName].gameNames.push(gameToAdd)
    return true
}

/**
 * username adicionado
 */
async function groupDetails(groupName, userName){
     return users[userName].groups[groupName]
}

/**
 * username adicionado
 */
async function deleteGroup(groupName, userName){
    delete users[userName].groups[groupName]
    return true
}

/**
 * username adicionado
 */
async function deleteGameByName(groupName, gameName, userName){
    const gameArray = users[userName].groups[groupName].gameNames
    users[userName].groups[groupName].gameNames = gameArray.filter(name => gameName !== name)
    return true
} 

/**
 * Novo
 */
async function tokenToUsername(token) {
	return tokens[token];
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