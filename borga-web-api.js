'use strict'

const express = require('express');

module.exports = function (services){

    async function runCatching(req, res, block){
        try{
            return await block(req, res)
        }catch(err){
            onError(req, res, err)
        }
    }

    function onError(req, res, err) {
		switch (err.name) {
			case 'NOT_FOUND': 
				res.status(404);
				break;
			case 'EXT_SVC_FAIL':
				res.status(502);
				break;
			case 'MISSING_PARAM': 
                res.status(400);
                break;
			case 'INVALID_PARAM': 
				res.status(400); // Tirem la o ocupado e vejam o disc
				break;
			default:
				res.status(500);				
		}
		res.json({ cause: err });
	}

    async function getMostPopularGames(req, res){
        return await runCatching(req, res, async (req, res) => {
            const games = await services.getPopularGames()
            res.json(games)
        })
    }

    function getGameByName(req, res){
        
    }

    function getMyGroups(req, res){
        
    }

    function addGameByName(req, res){
        
    }

    function editGroup(req, res){
        
    }
    

    function deleteGroupByName(req, res){

    }
    
    function getGroupDetails(req,res){
        
    }

    function deleteGameByName(req, res){
        
    }
    
    const router = express.Router()

    router.use(express.json());

    router.get("/global/popular", getMostPopularGames)
    router.get("/global/:gameName", getGameByName)
    

    // Resource /my/groups
    router.get("/my/groups", getMyGroups)
    router.post("/my/groups", addGameByName)
    router.post("/my/groups", editGroup)

    // Resource /my/groups/<groupName>
    router.get("/my/groups/:groupName", getGroupDetails)
    router.delete("/my/groups/:groupName", deleteGroupByName)

    // Resource /my/groups/<groupName>/<gameName>
    router.delete("/my/groups/:groupName/:gameName", deleteGameByName)

    return router
}
