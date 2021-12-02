'use strict'

//const require

module.exports = (games_data, data_mem) => {

    /**
     * Novo
     */
    async function getUsername(token) {
		if (!token) throw errors.UNAUTHENTICATED('no token');
		const username = await data_mem.tokenToUsername(token);
		if(!username) throw errors.UNAUTHENTICATED('bad token');
		return username;
	}

    async function getPopularGames(){
        return await games_data.findPopularGames()    
    } 

    async function getGameWithName(gameName){
        return await data_mem.hasGame(gameName) ? await data_mem.getGame(gameName) : await getGameFromBorgaAPI(gameName)
    }
    
    async function addGameToGroup(groupName, gameName){
        if(await !data_mem.hasGame(gameName)){
            await getGameFromBorgaAPI(gameName)
        }
        return await data_mem.addGameToGroup(groupName, gameName)
    }

    async function getGameFromBorgaAPI(gameName){
        const gameFromBorga = await games_data.findGameByName(gameName)
        await data_mem.addGameToCollection(gameFromBorga)
        return gameFromBorga
    }

    async function createNewGroup(groupName, groupDescription, token){
        const userName = await getUsername(token)
        return await data_mem.createNewGroup(groupName, groupDescription, userName)
    }

    async function getGroups(token){
        const userName = await getUsername(token)
        return await data_mem.getGroups(userName)
    }

    async function editGroup(groupName, newGroupName, newDescription, token){
        const userName = await getUsername(token)
        return await data_mem.editGroup(groupName, newGroupName, newDescription, userName) 
    }

    async function groupDetails(groupName, token){
        const userName = await getUsername(token)
        return await data_mem.groupDetails(groupName, userName)
    }

    async function deleteGroup(groupName, token){
        const userName = await getUsername(token)
        return await data_mem.deleteGroup(groupName, userName)
    }

    async function deleteGameByName(groupName, gameName, token){
        const userName = await getUsername(token)
        return await data_mem.deleteGroup(groupName, gameName, userName)
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
        deleteGameByName: data_mem.deleteGameByName
    }
}