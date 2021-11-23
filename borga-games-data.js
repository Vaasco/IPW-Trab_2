'use strict'

/**
 *Dependecies
 */
require("dotenv").config()
const fetch = require('node-fetch')

/**
 * 
 */
const ATLAS_BORGA_ID = process.env.ATLAS_BORGA_ID
const GAMES_BASE_URI = "https://api.boardgameatlas.com/api/search?"
const CLIENT_QUERY = `&client_id=${ATLAS_BORGA_ID}`
const HTTP_SERVER_ERROR = 5;

/**
 * Gets the number that represents the status. (5 -> represents status 500, 501...).
 */
function getStatusClass(statusCode) {
	return ~~(statusCode / 100);
}


/**
 * Starts the process of fetching a resource from the network, 
 * returning a promise which is fulfilled once the response is available.
 */
function do_fetch(uri){
    return fetch(uri)
        .catch(err => { throw EXT_SVC_FAIL(err) })
        .then(res => {
            if(res.ok){
                return res.json()
            }else {
                if(res.status === 404){
                    throw errors.NOT_FOUND(uri)
                }
                if(getStatusClass(res.status) === HTTP_SERVER_ERROR){
                    return res.json()
                        .catch (err => err)
                        .then(info => {throw errors.EXT_SVC_FAIL(info)})        
                }else{
                    throw errors.FAIL(res)
                }
            }   
        })       
}

/**
 * Returns null if the parameter is undefined. 
 */
function nullIfUndefined(any){
    return any !== undefined ? any : null
}


/**
 * Returns a new game object with the given properties.
 */
function makeGameObj(gameInfo){

    /**
     * Replaces undefined for null of all undefined properties.
     */
    const handleProperties = (myObject) => {
        Object.keys(myObject).map(function(key, index) {
            myObject[key] = nullIfUndefined(myObject[key]);
          });
        return myObject
    } 
    
    return handleProperties({
        id: gameInfo.id,
        url: gameInfo.url,
        name: gameInfo.name,
        price: gameInfo.price,
        min_players: gameInfo.min_players,
        max_players: gameInfo.max_players,
        min_age: gameInfo.min_age,
        //description: gameInfo.description_preview,
        image_url: gameInfo.image_url,
        rules_url: gameInfo.rules_url,
        amazon_rank: gameInfo.amazon_rank,
        official_url: gameInfo.official_url,
        borga_rank: gameInfo.rank
    })
}

/**
 * Fetches the 10 most popular games by borga rank
 */
async function findPopularGames(){
    return do_fetch(GAMES_BASE_URI+"order_by=rank&limit=10&ascending=false"+CLIENT_QUERY)
        .then(answer => {
            return answer.games.map(makeGameObj)
        })
}

module.exports = {
    findPopularGames: findPopularGames
}