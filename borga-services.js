'use strict'

//const require

module.exports = (games_data, data_mem) => {


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

    return {
        getPopularGames: getPopularGames,
        getGameWithName: getGameWithName,
        addGameToGroup: addGameToGroup,
        createNewGroup: data_mem.createNewGroup,
        getMyGroups: data_mem.getGroups,
        editMyGroup: data_mem.editGroup,
        getDetails: data_mem.groupDetails,
        deleteGroup: data_mem.deleteGroup,
        deleteGameByName: data_mem.deleteGameByName
    }
}