'use strict'

//const require

module.exports = (games_data, data_mem) => {

        async function getPopularGames(){
           const popularGames = await games_data.findPopularGames()
           return {popularGames}     
        } 


        
        return {
                getPopularGames: getPopularGames
        }

}