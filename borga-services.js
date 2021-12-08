'use strict'

const errors = require('./borga-errors.js');

// Error messages
const USER_LENGHT_ERROR = "User should have at least 4 and at most 16 characters."
const USER_ALREADY_EXISTS = "Username already exists"
const GROUP_ALREADY_EXISTS = "Group already exists"
const INVALID_GROUP = "Group does not exist in collection"
const NO_TOKEN = 'No token provided.'
const BAD_TOKEN = 'Wrong token provided.'
const MISSING_GROUP_NAME = "Missing group name."
const MISSING_GAME_NAME = "Missing game name."
const GAME_ALREADY_IN_GROUP = "Game already in this group."
const GAME_NOT_IN_GROUP = "Group has no game with this name."
const NAME_OR_DESCRIPTION_REQUIRED = "Need at least a new group name or a new description to edit a group."
const USERNAME_REQUIRED = "Username required."

module.exports = (games_data, data_mem) => {

    /**
     * Function used in functions that require the group existance
     */
    async function requireGroup(groupName, user){
        if(!(await data_mem.hasGroup(groupName, user))) throw errors.INVALID_PARAM(INVALID_GROUP)
    }
    /**
     * Creates a new user
     * @param userName 
     * @returns user response = {userName: "User", token: "Token"} 
     */
    async function createNewUser(userName){
        if(!userName) throw errors.MISSING_PARAM(USERNAME_REQUIRED)
        if(userName.length <= 4 || userName.length >= 16) 
            throw errors.INVALID_PARAM(USER_LENGHT_ERROR)
        const result = await data_mem.createNewUser(userName)
        if(result.success) 
            return {userName, token: result.token}
        else   
           throw errors.INVALID_PARAM(USER_ALREADY_EXISTS)
    }

    /**
     * Gets the user name associated to a token.
     * @param token
     * @returns the user name.
     */
    async function getUsername(token) {
		if (!token) throw errors.UNAUTHENTICATED(NO_TOKEN);
		const username = await data_mem.tokenToUsername(token);
		if(!username) throw errors.UNAUTHENTICATED(BAD_TOKEN);
		return username;
	}

    /**
     * Gets the most popular games.
     * @returns the list with the most popular games.
     */
    async function getPopularGames(){
        const games = await games_data.findPopularGames()  
        return {games}
    } 

    /**
     * Gets the game from the given name.
     * @param gameName name of the game to get.
     * @returns the requested game.
     */
    async function getGameWithName(gameName){
        const gameExists = await data_mem.hasGame(gameName)
        const game = gameExists ? await data_mem.getGame(gameName) : await getGameFromBorgaAPI(gameName)
        return {game}
    }

    /**
     * Gets a game from the Board Games Atlas and adds it to the game collection in memory.
     * @param gameName name of the game to get. 
     * @returns game from board game atlas api sanitized 
     */
    async function getGameFromBorgaAPI(gameName){
        const gameFromBorga = await games_data.findGameByName(gameName)
        await data_mem.addGameToCollection(gameFromBorga, gameName)
        return gameFromBorga
    }

     /**            Group Info Acess            **/

    /**
     * Gets the groups of a user.
     * @param token identifies the user that wants to get the groups. 
     * @returns an object with the list with the groups of the user associated to the given token. 
     */
    async function getGroups(token){
        const userName = await getUsername(token)
        const groups = await data_mem.getGroups(userName)
        return {groups}
    }
    
    /**
     * Gets the details of a group.
     * @param groupName name of the group to get the details.
     * @param token identifies the user that wants to get the details of one of his groups.
     * @returns an object with the group name.
     */
    async function groupDetails(groupName, token){
        const user = await getUsername(token)
        await requireGroup(groupName, user)
        const group = await data_mem.groupDetails(groupName, user)
        return { group }
    }

    /**              Group Modifications            **/

    /**
     * Creates a new group
     * @param groupName name of the group that is being created.
     * @param groupDescription description of the group.
     * @param token identifies who wants to create the group.
     * @returns an object with the group created
     */
     async function createNewGroup(groupName, groupDescription, token){
        const userName = await getUsername(token)
        if(await data_mem.hasGroup(groupName, userName)) throw errors.INVALID_PARAM(GROUP_ALREADY_EXISTS)
        if(!groupName) throw errors.MISSING_PARAM(MISSING_GROUP_NAME)
        const description = groupDescription || ""
        const group = await data_mem.createNewGroup(groupName, description, userName)
        return { group }
    }
    
    /**
     * Edits the groups of a user.
     * @param groupName name of the group to be edited.
     * @param newGroupName name to replace with the already existing one.
     * @param newDescription description to replace with the already existing one.
     * @param token identifies the user that wants to edit the group.
     * @returns an object with the group edited
     */
     async function editGroup(groupName, newGroupName, newDescription, token){
        const user = await getUsername(token)
        if(!groupName) throw errors.MISSING_PARAM(MISSING_GROUP_NAME)
        if(!newGroupName && !newDescription) throw errors.MISSING_PARAM(NAME_OR_DESCRIPTION_REQUIRED)
        await requireGroup(groupName, user)
        const group = await data_mem.editGroup(groupName, newGroupName, newDescription, user) 
        return { group }
    }

    /**
     * Deletes a group.
     * @param groupName name of the group to be deleted. 
     * @param token identifies the user that wants to delete one of his groups.
     * @returns an object with the groupName if deleted
     */
    async function deleteGroup(groupName, token){
        const user = await getUsername(token)
        await requireGroup(groupName, user)
        await data_mem.deleteGroup(groupName, user)
        return { groupName }
    }


    /**        Operations with games in groups              */

    /**
     * Adds a game to a group
     * @param groupName name of the group that will receive the game.
     * @param gameName name of the game to add to the group.
     * @param token 
     * @returns true if it was succesfully added.
     */
     async function addGameToGroup(groupName, gameName, token){   
        const user = await getUsername(token)
        if(!groupName) throw errors.MISSING_PARAM(MISSING_GROUP_NAME) 
        if(!gameName) throw errors.MISSING_PARAM(MISSING_GAME_NAME) 
        await requireGroup(groupName, user)
        const nameLowered = gameName.toLowerCase() 
        const gameExists = await data_mem.hasGame(nameLowered)
        if(!gameExists) await getGameFromBorgaAPI(nameLowered)
        
        const result = await data_mem.addGameToGroup(groupName, nameLowered, user)
        if(!result.success) throw errors.INVALID_PARAM(GAME_ALREADY_IN_GROUP)
        return {gameName: result.gameAdded} 
    }

    /**
     * Deletes a game by it´s name.
     * @param groupName name of the group where the game is inserted.
     * @param gameName name of the game to be deleted. 
     * @param token identifies the user that wants to delete one of his games from a group.
     * @returns true if the delete was succesfull.
     */
    async function deleteGameByName(groupName, gameName, token){
        const user = await getUsername(token)
        await requireGroup(groupName, user)
        const nameLowered = gameName.toLowerCase()
        const result = await data_mem.deleteGameByName(groupName, nameLowered, user)
        if(!result.success) throw errors.INVALID_PARAM(GAME_NOT_IN_GROUP)
        return {gameName: result.gameName} 
    }
    
    return {
        getPopularGames: getPopularGames,
        getGameWithName: getGameWithName,
        addGameToGroup: addGameToGroup,
        createNewGroup: createNewGroup,
        getMyGroups: getGroups,
        editMyGroup: editGroup,
        getDetails: groupDetails,
        deleteGroup: deleteGroup,
        deleteGameByName: deleteGameByName,
        createNewUser: createNewUser
    }
}