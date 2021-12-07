'use strict'
const errors = require('./borga-errors.js');

module.exports = (games_data, data_mem) => {

    /**
     * Gets the user name associated to a token.
     * @throws {UNAUNTHENTICATED} if the token or the user name doesn´t exist.
     * @param token
     * @returns the user name.
     */
    async function getUsername(token) {
		if (!token) throw errors.UNAUTHENTICATED('no token');
		const username = await data_mem.tokenToUsername(token);
		if(!username) throw errors.UNAUTHENTICATED('bad token');
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
     * @returns the requested game.
     */
    async function getGameWithName(gameName){
        return await data_mem.hasGame(gameName) ? await data_mem.getGame(gameName) : await getGameFromBorgaAPI(gameName)
    }
    
    /**
     * Adds a game to a group
     * @param groupName name of the group that will receive the game.
     * @param gameName name of the game to add to the group.
     * @param token 
     * @returns true if it was succesfully added.
     */
    async function addGameToGroup(groupName, gameName, token){
        if(await !data_mem.hasGame(gameName)){
            await getGameFromBorgaAPI(gameName)
        }
        return await data_mem.addGameToGroup(groupName, gameName)
    }

    /**
     * Gets a game from the Board Games Atlas and adds it to the internal memory game collection.
     * @param gameName name of the game to get. 
     * @returns game. 
     */
    async function getGameFromBorgaAPI(gameName){
        const gameFromBorga = await games_data.findGameByName(gameName)
        await data_mem.addGameToCollection(gameFromBorga)
        return gameFromBorga
    }

    /**
     * Creates a new group
     * @param groupName name of the group that is being created.
     * @param groupDescription description of the group.
     * @param token identifies who wants to create the group.
     * @returns the list with the groups of the user associated to the given token.
     */
    async function createNewGroup(groupName, groupDescription, token){
        const userName = await getUsername(token)
        return await data_mem.createNewGroup(groupName, groupDescription, userName)
    }

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
     * Edits the groups of a user.
     * @param groupName name of the group to be edited.
     * @param newGroupName name to replace with the already existing one.
     * @param newDescription description to replace with the already existing one.
     * @param token identifies the user that wants to edit the group.
     * @returns the list with the groups of the user associated to the given token. 
     */
    async function editGroup(groupName, newGroupName, newDescription, token){
        const userName = await getUsername(token)
        return await data_mem.editGroup(groupName, newGroupName, newDescription, userName) 
    }

    /**
     * Gets the details of a group.
     * @param groupName name of the group to get the details.
     * @param token identifies the user that wants to get the details of one of his groups.
     * @returns the group identified by the group name.
     */
    async function groupDetails(groupName, token){
        const userName = await getUsername(token)
        return await data_mem.groupDetails(groupName, userName)
    }

    /**
     * Deletes a group.
     * @param groupName name of the group to be deleted. 
     * @param token identifies the user that wants to delete one of his groups.
     * @returns true if the delete was succesfull.
     */
    async function deleteGroup(groupName, token){
        const userName = await getUsername(token)
        return await data_mem.deleteGroup(groupName, userName)
    }

    /**
     * Deletes a game by it´s name.
     * @param groupName name of the group where the game is inserted.
     * @param gameName name of the game to be deleted. 
     * @param token identifies the user that wants to delete one of his games from a group.
     * @returns true if the delete was succesfull.
     */
    async function deleteGameByName(groupName, gameName, token){
        const userName = await getUsername(token)
        return await data_mem.deleteGameByName(groupName, gameName, userName)
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
        createNewUser: data_mem.createNewUser
    }
}