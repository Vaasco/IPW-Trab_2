

'use strict'

/**Dependecies.*/
const crypto = require('crypto')
const errors = require('./borga-errors.js');

/**Object with the users and their respective groups.*/
const users = {
    'costakilapada': {groups: {}},
    'jsmagician': {groups: {}},
    'vascao': {groups: {}}
}

/**Object with the tokens and their respective user.*/
const tokens = { 
    'abd331d7-fd48-4054-9b73-7b7edf2941a6': 'costakilapada',
    '255f06fe-46b9-44b9-ba5a-6acdf72347b9': 'vascao',
    '84ea5f5b-8e03-421b-8edb-16a0ae89eb7f': 'jsmagician'     
}

/**Object with the requested games.*/
const gameCollection = {games: {}}

/**
 * Creates a token and links it to the given name creating a new user.
 * @param name to link to the token.
 * @returns true if the new user was created succesfully.
 */
async function createNewUser(name){
    let success = false
    const userExists = await hasUser(name)
    if(userExists) return {success}
    const token = crypto.randomUUID()
    tokens[token] = name 
    users[name] = { groups: {}}
    success = true
    return {success , token}
}

/**
 * Cheks if already exists a user with {name} in {users}
 */
async function hasUser(name){
    return !!users[name]
}

/**
 * Adds a game to the intern memory collection.
 * @param game to add to the collection.
 * @returns true if the game was added to the collection succesfully.
 */
async function addGameToCollection(game, gameName){
    gameCollection.games[gameName] = game
    return true 
}

/**
 * Gets the game from the collection
 * @param gameName of the game to get
 * @returns game from the collection 
 */
async function getGame(gameName){
    return gameCollection.games[gameName]
}

/**
 * Checks if there is a game identified by {gameName} in game's collection.
 * @param gameName of the game to check. 
 * @returns true if game exists
 */
async function hasGame(gameName){         
    return !!gameCollection.games[gameName]
}

/**
 * 
 */
 async function hasGroup(groupName, userName){
    return !!users[userName].groups[groupName]
}

/**
 *  Creats a new group for the given user name with the given name and description.
 *  @param groupName group to add.
 *  @param groupDescription description to add.
 *  @param userName user that wants to add a new group to his collection.
 *  @returns the new user´s groups.
 */
async function createNewGroup(groupName, groupDescription, userName){
    users[userName].groups[groupName] = {
                name: groupName, 
                description: groupDescription,
                gameNames: []
            }
    
    return users[userName].groups[groupName]
}

/**
 * Gets the groups of a user
 * @param userName user that wants to get the groups
 * @returns an array with the groups of the user
 */
async function getGroups(userName){
    return Object.values(users[userName].groups)
}

/**
 * Edits a group of a user with the given new name and description.
 * @param groupName the group to replace it´s name and description.
 * @param givenName given group name to replace with the current one.
 * @param newDescription given description to replace with the current one.
 * @param userName user that wants to edit the group name and description.
 * @returns the user´s updated groups.
 */
async function editGroup(groupName, givenName, newDescription, userName){
    const userToEdit = users[userName]
    const desc = newDescription || userToEdit.groups[groupName].description 
    const newName = givenName || groupName
    const games = userToEdit.groups[groupName].gameNames
    delete userToEdit.groups[groupName]   
    userToEdit.groups[newName] = {
        name: newName,
        description: desc,
        gameNames: games
    }
    return userToEdit.groups[newName] 
}

/**
 * Adds a game to a group.
 * @param groupName group that will have the added game.
 * @param gameToAdd game to add to a group.
 * @param userName user name that wants to add a game
 * @returns true if the game was added succesfully.
 */
async function addGameToGroup(groupName, gameToAdd, userName){
    const groupNeeded =users[userName].groups[groupName]
    if(groupNeeded.gameNames.includes(gameToAdd)) return {success: false}
    groupNeeded.gameNames.push(gameToAdd)
    return {success: true, gameAdded: gameToAdd}
}

/**
 * Gets the details of a group
 * @param groupName of the group in order to get the details.
 * @param userName of the user that wants to get the details.
 * @returns the details of the group.
 */
async function groupDetails(groupName, userName){
    return users[userName].groups[groupName]
}

/**
 * Deletes a group
 * @param groupName of the group in order to delete it.
 * @param userName of the user that wants to delete the group.
 * @returns true if the group was deleted succesfully.
 */
async function deleteGroup(groupName, userName){
    delete users[userName].groups[groupName]
}

/**
* Deletes a game from a group
* @param groupName of the group that will have a game deleted.
* @param gameName of the game that the user wants to delete.
* @param userName of the user that wants to delete it.
* @returns true if the game was deleted succesfully.
*/
async function deleteGameByName(groupName, gameName, userName){
    const gameArray = users[userName].groups[groupName].gameNames
    if(!gameArray.includes(gameName)) return {success: false}
    users[userName].groups[groupName].gameNames = gameArray.filter(name => gameName !== name)
    return {success: true, gameName}
} 

/**
 * Gives the user name linked to a token
 * @param token 
 * @returns the user name
 */
async function tokenToUsername(token) {
	return tokens[token];
}

/**
 * 
 */
 async function reset() {
	Object.values(users).forEach(user => {
		user.groups = {};
	});
}

module.exports = {
    createNewGroup: createNewGroup,
    getGroups: getGroups,
    editGroup: editGroup,
    groupDetails: groupDetails,
    deleteGroup: deleteGroup,
    hasGroup: hasGroup,
    hasGame: hasGame,
    getGame: getGame,
    addGameToCollection: addGameToCollection,
    addGameToGroup: addGameToGroup,
    deleteGameByName: deleteGameByName,
    createNewUser: createNewUser,
    tokenToUsername: tokenToUsername,
    reset: reset  
}