'use strict'

const express = require('express');
const logs = require("./logs")

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borgaDocs.json');

module.exports = function (services){

    function getUserToken(req) {
		return  req.user && req.user.token;
	}

    /**
     * Gets the Bearer Token from the request (Authorization header).
     * @param req the request.
     * @returns a formatted Bearer Token if the Authorization header is not undefined else returns null.
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

    /**
     * Gets the status of the response and retrieves the associated error. 
     * @param res the response.
     * @param err the error.
     */    
    function onError(res, err) {
        logs.fail('ERROR', JSON.stringify(err, null, 2));
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
            case 'UNAUTHENTICATED': 
				res.status(401);
			break;    
			default:
				res.status(500);				
		}
		res.json({ cause: err });
	}

    /**
     * Gets the most popular games. 
     * @throws the respective {onError()} error.
     * @param res the response.  
     */
    async function getMostPopularGames(_, res){
        try{
            const games = await services.getPopularGames()
            res.json(games)
        }catch(err){
            onError(res,err)
        }
    }

    /**
     * Gets a game by its name.
     * @throws the respective {onError()} error.
     * @param req the request.
     * @param res the response.
     */
    async function searchGameByName(req, res){
        try{
            const gameName = req.query.gameName.toLowerCase()
            const game = await services.searchGameByName(gameName)
            res.json(game)   
        }
        catch(err){
            onError(res,err)
        }
    }

    /**
     * Adds a group to an user.
     * @throws the respective {onError()} error.
     * @param req the request. 
     * @param res the response.
     */
    async function addGroup(req, res){
        try{
            const body = req.body
            const group = await services.createNewGroup(body.groupName, body.groupDescription, getUserToken(req))
            res.json(group) 
        }
        catch(err){
            onError(res,err)
        }
    }

    /**
     * Gets all the groups associated to an user.
     * @throws the respective {onError()} error.
     * @param req the request.
     * @param res the response.
     */
    async function getMyGroups(req, res){
        try{
            const groups = await services.getMyGroups(getUserToken(req))
            res.json(groups)
        }
        catch(err){
            onError(res,err)
        }
    }

    /**
     * Adds a game by its name to a user's group.
     * @throws the respective {onError()} error.
     * @param req the request. 
     * @param res the response.
     */
    async function addGameByID(req, res){
        try{
            const params = req.params
            const gameID = params.gameID
            const groupID = params.groupID
            const added = await services.addGameToGroup(groupID, gameID, getUserToken(req))
            res.json(added)
        }
        catch(err){
            onError(res,err)
        }
    }

    /**
     * Edits a group associated to the user that requested it.
     * @throws the respective {onError()} error.
     * @param req the request. 
     * @param res the response.
     */
    async function editGroup(req, res){
        try{
            const body = req.body
            const groupId = req.params.groupID
            const newGroup = await services.editMyGroup(
                groupId, 
                body.newGroupName, 
                body.newGroupDescription, 
                getUserToken(req)
            )
            res.json(newGroup) 
        }
        catch(err){
            onError(res,err)
        }
    }
    
    /**
     * Deletes a group by its name of the user that requested it.
     * @throws the respective {onError()} error. 
     * @param req the request. 
     * @param res the response. 
     */
    async function deleteGroupById(req, res){
        try{
            const groupID = req.params.groupID
            const deleted = await services.deleteGroup(groupID, getUserToken(req))
            res.json(deleted)
        }catch(err){
            onError(res, err)
        }
    }
    
    /**
     * Gets the details of a group of the user that requested it.
     * @throws the respective {onError()} error. 
     * @param req the request. 
     * @param res the response. 
     */
    async function getGroupDetails(req,res){
        try{
            const groupID = req.params.groupID
            const group = await services.groupDetails(groupID, getUserToken(req))
            res.json(group)
        }catch(err){
            onError(res, err)
        }
    }

    /**
     * Deletes a game by its name of the user that requested it
     * @throws the respective {onError()} error. 
     * @param req the request 
     * @param res the response 
     */
    async function deleteGameFromGroup(req, res){
        try{
            const params = req.params
            const gameID = params.gameID
            const deletedGame = await services.deleteGameByID(params.groupID,gameID, getUserToken(req))
            res.json(deletedGame)
        }catch(err){
            onError(res, err)
        }
    }

    /**
     * Creates a new user
     * @throws the respective {onError()} error.  
     * @param req the request 
     * @param res the response 
     */
    async function createNewUser(req,res){
        try{
            const userName = req.body.userName
            const password = req.body.password
            const newUser = await services.createNewUser(userName, password)
            res.json(newUser)        
        }catch(err){
            onError(res, err)
        }
    }

    async function getGameDetails(req, res){
        try{
            const details = await services.getGameDetails(req.params.gameID, getUserToken(req))
            res.json(details)
        }catch(err){
            onError(res, err)
        }
    }

    function extractToken(req, res, next) {
		const bearerToken = getBearerToken(req);
		if (bearerToken) {
			req.user = { token: bearerToken };
		}
		next();
	}

    const router = express.Router()
    
    router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

    router.use(express.json());
    router.use('/my', extractToken);
         
    
    router.get("/games", searchGameByName)
    router.get("/games/popular", getMostPopularGames)
    router.get("/games/:gameID", getGameDetails)
    router.post("/register", createNewUser) 

    // Resource /my/groups
    router.get("/my/groups", getMyGroups)
    router.post("/my/groups", addGroup)

    router.put("/my/groups/:groupID", editGroup)

    // Resource /my/groups/<groupID>
    router.get("/my/groups/:groupID", getGroupDetails)
    router.delete("/my/groups/:groupID", deleteGroupById)
    

    // Resource /my/groups/<groupID>/<gameID>
    router.delete("/my/groups/:groupID/:gameID", deleteGameFromGroup)
    router.post("/my/groups/:groupID/:gameID", addGameByID)

    return router
}
