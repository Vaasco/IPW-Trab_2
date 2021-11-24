'use strict'

//const require

module.exports = (games_data, data_mem) => {

        async function getPopularGames(){
           const popularGames = await games_data.findPopularGames()
           return {popularGames}     
        } 

        async function getGameWithName(gameName){
           const game = await games_data.findGameByName(gameName)    
           return {game} 
        }
        
        return {
                getPopularGames: getPopularGames,
                getGameWithName: getGameWithName,
                createNewGroup: data_mem.createNewGroup,
                getMyGroups: data_mem.getGroups,
                editMyGroup: data_mem.editGroup
        }
}