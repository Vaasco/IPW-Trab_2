'use strict'

const express = require('express');
/**
 * Novo
 */
const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/aliche-spec.json');

module.exports = function (services){

    /**
     * Novo
     */
    function getBearerToken(req) {
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0,6).toLowerCase() === 'bearer') {
				return authData.replace(/^bearer\s+/i, '');
			}
		}
		return null;
	}

    async function runCatching(block){
        try{
            return await block()
        }catch(err){
            console.log(err)
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
            /**
             * Novo 
             */    
            case 'UNAUTHENTICATED': 
				res.status(401);
			break;    
			default:
				res.status(500);				
		}
        console.log('[ERROR]', err);
		res.json({ cause: err });
	}

    async function getMostPopularGames(_, res){
        return await runCatching(async () => {
            const games = await services.getPopularGames()
            res.json(games)
        })
    }

    async function getGameByName(req, res){
        return await runCatching(async() =>{
            const gameName = req.params.gameName 
            const game = await services.getGameWithName(gameName)
            res.json(game)        
        })
    }

    async function addGroup(req, res){
        return await runCatching(async() =>{
            const body = req.body
            const group = await services.createNewGroup(body.groupName, body.groupDescription, getBearerToken(req))
            res.json(group)
        })
    }

    async function getMyGroups(_, res){
        return await runCatching( async() =>{
            const groups = await services.getMyGroups()
            res.json(groups)
        })
    }

    async function addGameByName(req, res){
        return await runCatching(async() =>{
            const body = req.body
            const added = await services.addGameToGroup(body.groupName, body.gameName, getBearerToken(req))
            res.json(added)
        })
    }

    async function editGroup(req, res){
        return await runCatching(async() =>{
            const body = req.body
            const newGroups = await services.editMyGroup(body.groupName, body.newGroupName
                , body.groupDescription
                ,getBearerToken(req)
                )
            res.json(newGroups)
        })
    }
    

    async function deleteGroupByName(req, res){
        return await runCatching(async() => {
            const groupName = req.params.groupName
            const deleted = await services.deleteGroup(groupName, getBearerToken(req))
            res.json(deleted)
        })
    }
    
    async function getGroupDetails(req,res){
        return await runCatching(async() => {
            const groupName = req.params.groupName
            const group = await services.getDetails(groupName, getBearerToken(req))
            res.json(group)
        })
    }

    async function deleteGameByName(req, res){
        return await runCatching(async() => {
            const params = req.params
            const deletedGame = await services.deleteGameByName(params.groupName,params.gameName, getBearerToken(req))
            res.json(deletedGame)
        })
    }
    
    /**
     * Novo
     */
    router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

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
