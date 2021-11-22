'use strict'
require("dotenv").config()
const fetch = require('node-fetch')
const ATLAS_BORGA_ID = process.env.ATLAS_BORGA_ID
const GAMES_BASE_URI = "https://api.boardgameatlas.com/api/search?"
const CLIENT_QUERY = `&client_id=${ATLAS_BORGA_ID}`
const HTTP_SERVER_ERROR = 5;

function getStatusClass(statusCode) {
	return ~~(statusCode / 100);
}

// most popular = 

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


function findPopularGames(){
    return do_fetch(GAMES_BASE_URI+"order_by=rank&limit=10&ascending=false"+CLIENT_QUERY)
        .then(answer => {
            return answer
        })
           
}

