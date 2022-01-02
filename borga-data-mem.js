

'use strict'

/**Dependecies.*/
const crypto = require('crypto')
const errors = require('./borga-errors.js');

module.exports = function (guest){

    /**Object with the tokens and their respective user.*/
    const tokens = { 
        'abd331d7-fd48-4054-9b73-7b7edf2941a6': 'costakilapada',
        '255f06fe-46b9-44b9-ba5a-6acdf72347b9': 'vascao',
        '84ea5f5b-8e03-421b-8edb-16a0ae89eb7f': 'jsmagician',
        [guest.token]: guest.user     
    }

    const users = {
        'costakilapada': {groups: {}},
        'jsmagician': {groups: {}},
        'vascao': {groups: {}},
        [guest.user]: {groups: {}}
    }

    /**Object with the requested games.*/
    const gameCollection = {games: {}}  

    function generateRandomId(){
        return Math.floor(Math.random() * Math.floor(Math.random() * Date.now())).toString()
    }

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
     * Gives the user name linked to a token
     * @param token 
     * @returns the user name
     */
     async function tokenToUsername(token) {
        return tokens[token];
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
    async function addGameToCollection(game){
        gameCollection.games[game.id] = game
        return true 
    }

    /**
     * Gets the game from the collection
     * @param gameID of the game to get
     * @returns game from the collection 
     */
    async function getGame(gameID){
        const game = gameCollection.games[gameID]
        if(!game) throw errors.NOT_FOUND("Game not found!")
        return {...game}
    }

    /**
     * Checks if there is a game identified by {gameID} in game's collection.
     * @param gameName of the game to check. 
     * @returns true if game exists
     */
    async function hasGameByID(gameID){ return !!getGame(gameID) }

    /**
     * Checks if there is a game identified by {gameName} in game's collection.
     * @param gameName of the game to check. 
     * @returns true if game exists
     */
    async function hasGameByName(gameName){         
        return Object.values(gameCollection).some((game) => gameName === game.name)
    }


    /**
     * 
     */
    async function hasGroup(groupID, userName){
        return !!users[userName].groups[groupID]
    }

    /**
     *  Creats a new group for the given user name with the given name and description.
     *  @param groupName group to add.
     *  @param groupDescription description to add.
     *  @param userName user that wants to add a new group to his collection.
     *  @returns the new user's groups.
     */
    async function createNewGroup(groupName, groupDescription, userName){
        const groupGeneratedId = generateRandomId()
        const createdGroup = {
            name: groupName, 
            description: groupDescription,
            games: []
        }
        users[userName].groups[groupGeneratedId] = createdGroup
        
        return {success: true, groupObject: {name: createdGroup.name, description: createdGroup.description, id:groupGeneratedId}}
    }


    /**
     * Gets the groups of a user
     * @param userName user that wants to get the groups
     * @returns an array with the groups of the user
     */
    async function getGroups(userName){
        return Object.entries(users[userName].groups).map((entry) =>{ 
            const groupID = entry[0]
            const groupObject = entry[1]
            const groupCopy = {...groupObject}
            groupCopy.id = groupID
            return groupCopy
        })
    }

    /**
     * Edits a group of a user with the given new name and description.
     * @param groupID the group to be edited.
     * @param givenName given group name to replace with the current one.
     * @param newDescription given description to replace with the current one.
     * @param userName user that wants to edit the group name and description.
     * @returns the user's updated groups.
     */
    async function editGroup(groupID, givenName, newDescription, userName){
        const userToEdit = users[userName]
        const groupToEdit = userToEdit.groups[groupID]
        const desc = newDescription || groupToEdit.description 
        const newName = givenName || groupToEdit.groupName
        groupToEdit.name = newName
        groupToEdit.description = desc
        const returnCopy = {...groupToEdit}  
        delete returnCopy.games
        return {success: true, groupObject: returnCopy}
    }

    /**
     * Adds a game to a group.
     * @param groupID group that will have the added game.
     * @param gameID game to add to the group.
     * @param userName user name that wants to add a game
     * @returns true if the game was added succesfully.
     */
    async function addGameToGroup(groupID, gameID, userName){
        const groupNeeded = users[userName].groups[groupID]
        if(groupNeeded.games.includes(gameID)) return {success: false}
        groupNeeded.games.push(gameID)
        const gameToAdd = await getGame(gameID)
        return {success: true, responseObject: {groupName: groupNeeded.name ,gameName: gameToAdd.name}}
    } 

    /**
     * Gets the details of a group
     * @param groupID of the group in order to get the details.
     * @param userName of the user that wants to get the details. 
     * @returns the details of the group.
     */
    async function groupDetails(groupID, userName){
        const group = users[userName].groups[groupID]
        const groupCopy = {...group}
        const gamesPromise = group.games.map(async (id) => {
            const game = await getGame(id)
            const name = game.name
            return {id, name}            
        })
        groupCopy.games = await Promise.all(gamesPromise)
        return groupCopy
    }

    /**
     * Deletes a group
     * @param groupID group getting deleted.
     * @param userName of the user that wants to delete the group.
     * @returns true if the group was deleted succesfully.
     */
    async function deleteGroup(groupID, userName){
        const groupName = users[userName].groups[groupID].name
        delete users[userName].groups[groupID]
        return {success: true, groupObject: {name: groupName}}
    }

    /**
    * Deletes a game from a group
    * @param groupName of the group that will have a game delete.
    * @param gameName of the game that the user wants to delete.
    * @param userName of the user that wants to delete it.
    * @returns true if the game was deleted succesfully.
    */
    async function deleteGameFromGroup(groupID, gameID, userName){
        const gameArray = users[userName].groups[groupID].games
        if(!gameArray.includes(gameID)) return {success: false}
        const group =  users[userName].groups[groupID]
        group.games = gameArray.filter(id => gameID !== id)
        const gameRemoved = await getGame(gameID)
        return {success: true, responseObject: {groupName: group.name, gameName: gameRemoved.name}}
    } 

    

    /**
     * Erases the content of the grops inside the user object
     */
    async function reset() {
        Object.values(users).forEach(user => {
            user.groups = {};
        });
    }

    async function collectionIsEmpty(){
        return Object.entries(gameCollection.games).length === 0
    }

    async function saveMechanics(mechanics){
        gameCollection.mechanics = mechanics
    }

    async function saveCategories(categories){
        gameCollection.categories = categories
    }

    async function getMechanics(gameID){
        return await getInfoNames(gameID, 'mechanics')
    }

    async function getCategories(gameID){
        return await getInfoNames(gameID, 'categories')
    }

    async function getInfoNames(gameID, info){
        const game = await getGame(gameID)
        const infoIDs = game[info].map((obj) => obj.id)
        const gameInfoSet = new Set(infoIDs)
        const gameInfoObjects = gameCollection[info].filter((infoElem) => {
            return gameInfoSet.has(infoElem.id)
        })
        return gameInfoObjects.map((elem) => elem.name)
    }

    return {
        createNewGroup: createNewGroup,
        getGroups: getGroups,
        editGroup: editGroup,
        groupDetails: groupDetails,
        deleteGroup: deleteGroup,
        hasGroup: hasGroup,
        hasGame: hasGameByID,
        hasGameByName: hasGameByName,
        getGame: getGame,
        addGameToCollection: addGameToCollection,
        addGameToGroup: addGameToGroup,
        deleteGameFromGroup: deleteGameFromGroup,
        createNewUser: createNewUser,
        tokenToUsername: tokenToUsername,
        saveCategories: saveCategories,
        saveMechanics: saveMechanics,
        collectionIsEmpty: collectionIsEmpty,
        getMechanics: getMechanics,
        getCategories: getCategories,
        reset: reset  
    }
}


