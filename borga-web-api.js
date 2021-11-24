'use strict'

const express = require('express');

module.exports = function (services){

    async function runCatching(req, res, block){
        try{
            return await block(req, res)
        }catch(err){
            onError(res, err)
        }
    }

    function onError(res, err) {
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
				res.status(400);
				break;
			default:
				res.status(500);				
		}
        console.log('[ERROR]', err);
		res.json({ cause: err });
	}

    async function getMostPopularGames(req, res){
        return await runCatching(req, res, async (_, res) => {
            const games = await services.getPopularGames()
            res.json(games)
        })
    }

    async function getGameByName(req, res){
        return await runCatching(req, res, async(req, res) =>{
            const gameName = req.params.gameName 
            const game = await services.getGameWithName(gameName)
            res.json(game)        
        })
    }

    async function addGroup(req, res){
        return await runCatching(req, res, async(req, res) =>{
            const body = req.body
            const group = await services.createNewGroup(body.groupName, body.groupDescription)
            res.json(group)
        })
    }

    async function getMyGroups(req, res){
        return await runCatching(req, res, async(_,res) =>{
            const groups = await services.getMyGroups()
            res.json(groups)
        })
    }

    function addGameByName(req, res){
        
    }

    async function editGroup(req, res){
        return await runCatching(req,res,async(req,res) =>{
            const body = req.body
            const newGroups = await services.editMyGroup(body.groupName, body.newGroupName, body.groupDescription)
            res.json(newGroups)
        })
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
    router.post("/my/groups", addGroup)

    // Resource /my/groups
    router.post("/my/groups/edit", editGroup)

    // Resource /my/groups/game
    router.post("/my/groups/game", addGameByName)

    // Resource /my/groups/<groupName>
    router.get("/my/groups/:groupName", getGroupDetails)
    router.delete("/my/groups/:groupName", deleteGroupByName)

    // Resource /my/groups/<groupName>/<gameName>
    router.delete("/my/groups/:groupName/:gameName", deleteGameByName)

    return router
}
