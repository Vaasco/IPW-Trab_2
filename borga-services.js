'use strict'
const errors = require('./borga-errors.js');

const USER_LENGHT_ERROR = "User should have at least 5 and at most 16 characters."
const USER_ALREADY_EXISTS = "Username already exists"
const GROUP_ALREADY_EXISTS = "Group already exists"
const INVALID_GROUP = "Group does not exist in collection"
const INVALID_GAME = "Game does not exist in our collection."
const NO_TOKEN = 'No token provided.'
const BAD_TOKEN = 'Wrong token provided.'
const INVALID_GROUP_NAME = "Group name invalid."
const MISSING_GROUP_NAME = "Missing group name."
const MISSING_GAME_NAME = "Missing game name."
const NAME_OR_DESCRIPTION_REQUIRED = "Need at least a new group name or a new description to edit a group."

module.exports = (games_data, data_mem) => {

    /**
     * 
     */
    async function requireGroup(groupName, user){
        if(!(await data_mem.hasGroup(groupName, user))) throw errors.INVALID_PARAM(INVALID_GROUP)
    }
    
    /**
     * 
     */
    async function requireGame(gameName){
        if(!(await data_mem.hasGame(gameName))) throw errors.INVALID_PARAM(INVALID_GAME)
    }

    async function createNewUser(userName){
        if(userName.length <= 5 || userName.length >= 16) 
            throw errors.INVALID_PARAM(USER_LENGHT_ERROR)
        const result = await data_mem.createNewUser(userName)
        if(result.success) 
            return {userName, token: result.token}
        else   
           throw errors.INVALID_PARAM(USER_ALREADY_EXISTS)
    }

    /**
     * Gets the user name associated to a token.
     * @throws {UNAUNTHENTICATED} if the token or the user name doesn´t exist.
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
        return await games_data.findPopularGames()    
    } 

    /**
     * Gets the game from the given name.
     * @param gameName name of the game to get.
     * @throws {MISSING_PARAM} error if no gameName is provided
     * @returns the requested game.
     */
    async function getGameWithName(gameName){
        const gameExists = await data_mem.hasGame(gameName)
        return  gameExists ? await data_mem.getGame(gameName) : await getGameFromBorgaAPI(gameName)
    }

    /**
     * Gets a game from the Board Games Atlas and adds it to the game collection in memory.
     * @param gameName name of the game to get. 
     * @returns game. 
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
     * @returns the list with the groups of the user associated to the given token. 
     */
    async function getGroups(token){
        const userName = await getUsername(token)
        return await data_mem.getGroups(userName)
    }
    
    /**
     * Gets the details of a group.
     * @param groupName name of the group to get the details.
     * @param token identifies the user that wants to get the details of one of his groups.
     * @returns the group identified by the group name.
     */
    async function groupDetails(groupName, token){
        const user = await getUsername(token)
        await requireGroup(groupName, user)
        return await data_mem.groupDetails(groupName, user)
    }

    /**              Group Modifications            **/

    /**
     * Creates a new group
     * @param groupName name of the group that is being created.
     * @param groupDescription description of the group.
     * @param token identifies who wants to create the group.
     * @returns the list with the groups of the user associated to the given token.
     */
     async function createNewGroup(groupName, groupDescription, token){
        const userName = await getUsername(token)
        if(await data_mem.hasGroup(groupName, userName)) throw errors.INVALID_PARAM(GROUP_ALREADY_EXISTS)
        if(!groupName) throw errors.MISSING_PARAM(MISSING_GROUP_NAME)
        const description = groupDescription || ""
        return await data_mem.createNewGroup(groupName, description, userName)
    }
    
    /**
     * Edits the groups of a user.
     * @param groupName name of the group to be edited.
     * @param newGroupName name to replace with the already existing one.
     * @param newDescription description to replace with the already existing one.
     * @param token identifies the user that wants to edit the group.
     * @returns the list with the groups of the user associated to the given token. 
     */
     async function editGroup(groupName, newGroupName, newDescription, token){
         // Não deixar trocar para nome igual TODO #3
        const user = await getUsername(token)
        if(!groupName) throw errors.MISSING_PARAM(MISSING_GROUP_NAME)
        if(!newGroupName && !newDescription) throw errors.MISSING_PARAM(NAME_OR_DESCRIPTION_REQUIRED)
        await requireGroup(groupName, user)
        return await data_mem.editGroup(groupName, newGroupName, newDescription, user) 
    }

    /**
     * Deletes a group.
     * @param groupName name of the group to be deleted. 
     * @param token identifies the user that wants to delete one of his groups.
     * @returns true if the delete was succesfull.
     */
    async function deleteGroup(groupName, token){
        const user = await getUsername(token)
        await requireGroup(groupName, user)
        return await data_mem.deleteGroup(groupName, userName)
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
        await requireGame(gameName)
        await data_mem.addGameToGroup(groupName, gameName, user)
        return {gameName} 
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
        await requireGame(gameName)
        if(await data_mem.deleteGameByName(groupName, gameName, user))
        return {gameName} 
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