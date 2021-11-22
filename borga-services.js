'use strict'


module.exports = (games_data, data_mem) => {

        async function getMostPopularGames(){
           const popularGames = await games_data.findPopularGames()
 
        }

}