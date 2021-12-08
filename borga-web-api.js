'use strict'

const express = require('express');

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borgaDocs.json');

module.exports = function (services){

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
        console.log('[ERROR]', err);
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
    async function getGameByName(req, res){
        try{
            const gameName = req.params.gameName.toLowerCase()
            const game = await services.getGameWithName(gameName)
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
            const group = await services.createNewGroup(body.groupName, body.groupDescription, getBearerToken(req))
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
            const groups = await services.getMyGroups(getBearerToken(req))
            res.json(groups)
        }
        catch(err){
            onError(res,err)
        }
    }

    /**
     * Adds a game by its name to a user´s group.
     * @throws the respective {onError()} error.
     * @param req the request. 
     * @param res the response.
     */
    async function addGameByName(req, res){
        try{
            const body = req.body
            const gameName = body.gameName
            const added = await services.addGameToGroup(body.groupName, gameName, getBearerToken(req))
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
            const newGroup = await services.editMyGroup(body.groupName, body.newGroupName
                , body.newDescription
                ,getBearerToken(req)
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
    async function deleteGroupByName(req, res){
        try{
            const groupName = req.params.groupName
            const deleted = await services.deleteGroup(groupName, getBearerToken(req))
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
            const groupName = req.params.groupName
            const group = await services.getDetails(groupName, getBearerToken(req))
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
    async function deleteGameByName(req, res){
        try{
            const params = req.params
            const gameName = params.gameName
            const deletedGame = await services.deleteGameByName(params.groupName,gameName, getBearerToken(req))
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
            const newUser = await services.createNewUser(userName)
            res.json(newUser)        
        }catch(err){
            onError(res, err)
        }
    }

    const router = express.Router()
    
    router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));

    router.use(express.json());

         
    router.get("/global/popular", getMostPopularGames)

    /**
     *  
     */
    router.get("/global/game/:gameName", getGameByName)
    
    /**
     * 
     *  /register:
     *    post:
     *     summary: Creates a new user.
     *        
     */
    router.post("/register", createNewUser)
    
    /**
     * 
     *  /my/groups:
     *   get:
     *    summary: Gets all the groups of an user's collection.
     *    security:
     *     - bearerAuth: []
     *  
     */
    router.get("/my/groups", getMyGroups)
    /**
     * 
     *  /my/groups:
     *   post:
     *    summary: Adds a new group to a user's collection.
     *    security: 
     *     - bearerAuth: []  
     */
    router.post("/my/groups", addGroup)

    // Resource /my/groups
    /**
     * 
     *  /my/groups/edit:
     *   post:
     *    summary: Edits a group of an user´s collection. 
     *    security: 
     *     - bearerAuth: []      
     */
    router.post("/my/groups/edit", editGroup)

    // Resource /my/groups/game
    /**
     * 
     *  /my/groups/game:
     *   post:
     *    summary: Adds a game to a group of an user´s collection. 
     *    security: 
     *     - bearerAuth: [] 
     */
    router.post("/my/groups/game", addGameByName)

    // Resource /my/groups/<groupName>
    /**
     * 
     *  /my/groups/{groupName}:
     *   get:
     *    summary: Gets the details of a group of an user's collection.
     *    security:
     *     - bearerAuth: [] 
     *    parameters:
     *      - in: path
     *        name: groupName
     *        schema:
     *         type: string
     *        required: true
     *        description: Name of the group to get the details.        
     */
    router.get("/my/groups/:groupName", getGroupDetails)
    /**
     * 
     *  /my/groups/{groupName}:
     *   delete:
     *     summary: Deletes a group from this user.
     *     security: 
     *      - bearerAuth: []  
     *     parameters:
     *      - in: path
     *        name: groupName
     *        schema:
     *         type: String
     *        required: true
     *        description: Name of the group to delete.
     */
    router.delete("/my/groups/:groupName", deleteGroupByName)

    // Resource /my/groups/<groupName>/<gameName>
    /**
     * 
     *  /my/groups/{groupName}/{gameName}: 
     *   delete:
     *    summary: Deletes a game of a group of a user's collection.
     *    security:
     *     - bearerAuth: []
     *    parameters:
     *     - in: path
     *       name: groupName
     *       schema:
     *        type: String
     *       required: true
     *       description: Name of the group that contains the game to delete.
     *     - in: path   
     *       name: gameName
     *       schema:
     *        type: String
     *       required: true
     *       description: Name of the game to delete.         
     */
    router.delete("/my/groups/:groupName/:gameName", deleteGameByName)

    return router
}
