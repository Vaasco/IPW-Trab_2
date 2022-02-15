'use strict'

/**Dependecies.*/
const crypto = require('crypto')
const errors = require('./borga-errors.js');
const fetch = require('node-fetch');
const logs = require('./logs.js');

const putConfigs = (obj) => {
    return {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj, null, 4)
    } 
}

const success = (status) => {
    return ~~(status / 100) === 2;
}

    

module.exports = function (es_spec, guest){


    const baseUrl = `${es_spec.url}`

    const userUrl = (userName) => `${baseUrl}${es_spec.prefix}_${userName}`;

    const gameCollectionURL = `${baseUrl}${es_spec.prefix}_gamecollection`

    function gameUrl(gameID){
        return `${gameCollectionURL}/_doc/${gameID}`
    }

    const tokensUrl = `${baseUrl}${es_spec.prefix}_tokens`

    const infoUrl = (infoName, infoObjId) => `${baseUrl}${es_spec.prefix}_${infoName}/_doc/${infoObjId}`
    

    
    function dbError(err){
        throw errors.FAIL(err)
    }
    
    /**
     * Temporary function
     */
    async function createGuestIndex(){
        try{
            await fetch(
                `${tokensUrl}/_doc/${guest.token}`,
                putConfigs({userName: guest.user, password: guest.password})
            )
            await fetch(userUrl(guest.user), {method: 'PUT'})
        }catch(err){
            dbError(err)
        }
    }


    function generateRandomId(){
        return Math.floor(Math.random() * Math.floor(Math.random() * Date.now())).toString()
    }

    /**
     * Creates a token and links it to the given name creating a new user.
     * @param name to link to the token.
     * @param password user password
     * @returns true if the new user was created succesfully.
     */
    async function createNewUser(userName, password){
       const name = userName.toLowerCase()
       try{
        const userExists = await hasUser(name)
        if(userExists) return {success: false}
        const token = crypto.randomUUID()
        const response = await fetch(
            `${tokensUrl}/_doc/${token}`,
            putConfigs({userName: name, password})
        )
        const createGroupIdx = await fetch(userUrl(name), {method: 'PUT'})
        return {
            success: success(response.status) && success(createGroupIdx.status), 
            token
        }
       }catch(err){
           dbError(err)
       }
    }

    /**
     * Gives the user name linked to a token
     * @param token 
     * @returns the user name
     */
     async function tokenToUsername(token) {
        try{
            const response = await fetch(
                `${tokensUrl}/_doc/${token}`
            )
            const tokenResponse = await response.json()
            return tokenResponse._source.userName
        }catch(err){
            dbError(err)
        }
    }

    /**
     * Cheks if already exists a user with {name} in users collection
     */
    async function hasUser(name){
        try{
            const response = await fetch(
                `${tokensUrl}/_search`
            )
            const tokensResponse = await response.json()
            const usersObjs = tokensResponse.hits.hits
            return usersObjs.some((obj) => {
                return obj._source.userName === name
            })
        }catch(err){
            dbError(err)
        }
        
    }

    /**
     * 
     * @param {*} game 
     * @returns 
     */
    async function getUser(userName){
        try{
            const response = await fetch(
                `${tokensUrl}/_search`
            )
            const tokensResponse = await response.json()
            
            const usersHits = tokensResponse.hits.hits
            const userObj = usersHits
                .find((obj) => obj._source.userName === userName )
            userObj._source.token = userObj._id
            return userObj._source
        }catch(err){
            dbError(err)
        }
    }

    /**     
     * Adds a game to the intern memory collection.
     * @param game to add to the collection.
     * @returns true if the game was added to the collection succesfully.
     */
    async function addGameToCollection(game){
       const gameID = game.id
       try{
            const response = await fetch(
                `${gameUrl(gameID)}?refresh=wait_for`,
                putConfigs(game)
            )
            return success(response.status)  
            
       }catch(err){
            dbError(err)
       }
    }

    /**
     * Gets the game from the collection
     * @param gameID of the game to get
     * @returns game from the collection 
     */
    async function getGame(gameID){
        try{
            const response = await fetch(
                gameUrl(gameID)
            )
            const gameResponse = await response.json()
            return gameResponse._source
        }catch(err){
            dbError(err)
        }
    } 

    /**
     * Checks if there is a game identified by {gameID} in game's collection.
     * @param gameName of the game to check. 
     * @returns true if game exists
     */
    async function hasGameByID(gameID){ 
        try{
            const response = await fetch(
                gameUrl(gameID)
            )
            return success(response.status)
        }catch(err){
            dbError(err)
        }
     }

    async function getGroup(groupID, userName){
        try{
            const response = await fetch(`${userUrl(userName)}/_doc/${groupID}`)
            const groupResponse = await response.json()
            return groupResponse._source
        }catch(err){
            dbError(err)
        }
    } 
    
    /**
     * 
     */
    async function hasGroup(groupID, userName){
        try{
            const response = await fetch(
                `${userUrl(userName)}/_doc/${groupID}`
            )
            return success(response.status)

        }catch(err){
            dbError(err)
        }
    }

    /**
     *  Creats a new group for the given user name with the given name and description.
     *  @param groupName group to add.
     *  @param groupDescription description to add.
     *  @param userName user that wants to add a new group to his collection.
     *  @returns the new user's groups.
     */
    async function createNewGroup(groupName, groupDescription, userName){
        try{
            const groupGeneratedId = generateRandomId()
            const createdGroup = {
                name: groupName, 
                description: groupDescription,
                games: []
            }
            const response = await fetch(
                `${userUrl(userName)}/_doc/${groupGeneratedId}?refresh=wait_for`,
                putConfigs(createdGroup)    
            )     
            return {success: success(response.status), groupObject: {name: createdGroup.name, description: createdGroup.description, id:groupGeneratedId}}            
        }catch(err){
            dbError(err)
        }
    }


    /**
     * Gets the groups of a user
     * @param userName user that wants to get the groups
     * @returns an array with the groups of the user
     */
    async function getGroups(userName){
        try{
            const response = await fetch(
                `${userUrl(userName)}/_search/`
            )    
            const groupsResponse = await response.json()
            const groupDocs = groupsResponse.hits.hits
            return groupDocs.map((elem) =>{
                const groupObj = elem._source
                groupObj.id = elem._id
                return groupObj
            })
        }catch(err){
            dbError(err)
        }
    }

    /**
     * Edits a group of a user with the given new name and description.
     * @param groupID the group to be edited.
     * @param givenName given group name to replace with the current one.
     * @param newDescription given description to replace with the current one.
     * @param userName user that wants to edit the group name and description.
     * @returns the user's updated groups.
     */
    async function editGroup(groupID, givenName, newDescription, userName){
       try{
            const groupToEdit = await getGroup(groupID, userName)
            const newDesc = newDescription || groupToEdit.description 
            const newName = givenName || groupToEdit.name
            groupToEdit.name = newName
            groupToEdit.description = newDesc
            const response = await fetch(
                `${userUrl(userName)}/_doc/${groupID}?refresh=wait_for`,
                 putConfigs(groupToEdit)
            )
            return {success: success(response.status), groupObject: groupToEdit}
       }catch(err){
            dbError(err)
       }
    }

    async function isGameInGroup(gameID, groupID, user){
        const group = await getGroup(groupID, user)
        return group.games.includes(gameID)
    }

    /**
     * Adds a game to a group.
     * @param groupID group that will have the added game.
     * @param gameID game to add to the group.
     * @param userName user name that wants to add a game
     * @returns true if the game was added succesfully.
     */
    async function addGameToGroup(groupID, gameID, userName){
        try{
            const group = await getGroup(groupID, userName)
            group.games.push(gameID)
            const response = await fetch(
                `${userUrl(userName)}/_doc/${groupID}?refresh=wait_for`,
                putConfigs(group)
            )
            const game = await getGame(gameID)
            return {success: success(response.status), responseObject: {groupName: group.name ,gameName: game.name}}
        }catch(err){
            dbError(err)
        }
    } 

    /**
     * Gets the details of a group
     * @param groupID of the group in order to get the details.
     * @param userName of the user that wants to get the details. 
     * @returns the details of the group.
     */
    async function groupDetails(groupID, userName){
        try{
            const group = await getGroup(groupID, userName)
            const gamesPromise = group.games.map(async (gameID) => {
                const game = await getGame(gameID)
                const name = game.name
                return {id: gameID, name}
            })
            group.games = await Promise.all(gamesPromise)
            group.id = groupID
            return group
        }catch(err){
            dbError(err)
        }
    }

    /**
     * Deletes a group
     * @param groupID group getting deleted.
     * @param userName of the user that wants to delete the group.
     * @returns true if the group was deleted succesfully.
     */
    async function deleteGroup(groupID, userName){
        try{
            const group = await getGroup(groupID, userName)
            const response = await fetch(
                `${userUrl(userName)}/_doc/${groupID}?refresh=wait_for`,
                {method: "DELETE"}
            )
            return {success: success(response.status), groupObject: {name: group.name}}
        }catch(err){
            dbError(err)
        }
    }

    /**
    * Deletes a game from a group
    * @param groupName of the group that will have a game delete.
    * @param gameName of the game that the user wants to delete.
    * @param userName of the user that wants to delete it.
    * @returns true if the game was deleted succesfully.
    */
    async function deleteGameFromGroup(groupID, gameID, userName){
        try{
            const group = await getGroup(groupID, userName)
            const games = group.games
            if(!games.includes(gameID)) return {success: false}
            group.games = games.filter(id => gameID !== id)
            const gameRemoved = await getGame(gameID)
            const response = await fetch(
                `${userUrl(userName)}/_doc/${groupID}?refresh=wait_for`,
                putConfigs(group)
            )
            return {success: success(response.status), responseObject: {groupName: group.name, gameName: gameRemoved.name}}
        }catch(err){
            dbError(err)
        }
    } 

    /**
     * Erases all the data stored in the data base.
     */
    async function reset() {
        try{
            
            await fetch(gameCollectionURL,{method: "DELETE"}) // Delete Collections Index
            await fetch(userUrl(guest.user), {method: 'DELETE'}) // Delete user Index
            await fetch(tokensUrl, {method:"DELETE"}) // Delete Tokens Index*/
            await fetch(userUrl("userteste"), {method: 'DELETE'}) // Delete user Index
        }catch(err){
            dbError(err)
        }
    }

    /**
     * 
     */
    async function saveInfo(info, infoName){
        try{
            const requestPromises = info.map(async (infoObj) =>{
                fetch(
                    infoUrl(infoName, infoObj.id)+"?refresh=wait_for",
                     putConfigs({infoObj})
                ) 
            })
            await Promise.all(requestPromises)
        }catch(err){
            dbError(err)
        }
    }
    
    /**
     * Saves the mechanics info in the database
     */
    async function saveMechanics(mechanics){
        await saveInfo(mechanics, "mechanics")
    }
    
    /**
     * Saves the categories info in the database
     */
    async function saveCategories(categories){
        await saveInfo(categories, "categories")
    }

    /**
     * Gets the names of [infoName] from [gameID]
     *
     * @param infoName used to chose between categories and mechanics
     */
    async function getInfoNames(gameID, infoName){
       try{
            const game = await getGame(gameID)
            const gameInfo = game[infoName]
            const infoObjects = gameInfo.map(async (infoObj) => {
                const response = await fetch(infoUrl(infoName, infoObj.id))
                const infoResponse = await response.json()
                const rv = infoResponse._source.infoObj
                return rv    
            })
            const objects = await Promise.all(infoObjects) 
            return await infoIDstoNames(gameInfo, objects)
       }catch(err){
            dbError(err)
       }
    }


    /**
     * Intersects the info ids from a game (gameInfo) with all of the info's ids.
     * 
     * @param gameInfo array of info ids from a game
     * @param info array of objects that contain each info name and id
     */
    async function infoIDstoNames(gameInfo, info){
        try{ 
            const infoIDs = gameInfo.map((obj) => obj.id)
            const gameInfoSet = new Set(infoIDs)
            const gameInfoObjects = info.filter(
                (infoElem) => gameInfoSet.has(infoElem.id)
            )
            return gameInfoObjects.map((elem) => elem.name) 
        }catch(err){
            dbError(err)
        } 
    }

    /**
     * @returns an array with the name of the mechanics from [gameID]
     */
    async function getMechanics(gameID){
        return await getInfoNames(gameID, "mechanics")
    }

    /**
     * @returns an array with the name of the categories from [gameID]
     */
    async function getCategories(gameID){
        return await getInfoNames(gameID, 'categories')
    }

    return {
        createNewGroup: createNewGroup,
        getGroups: getGroups,
        editGroup: editGroup,
        groupDetails: groupDetails,
        deleteGroup: deleteGroup,
        hasGroup: hasGroup,
        hasGame: hasGameByID,
        hasUser: hasUser,
        getGame: getGame,
        addGameToCollection: addGameToCollection,
        addGameToGroup: addGameToGroup,
        deleteGameFromGroup: deleteGameFromGroup,
        createNewUser: createNewUser,
        getUser: getUser,
        tokenToUsername: tokenToUsername,
        saveCategories: saveCategories,
        saveMechanics: saveMechanics,
        getMechanics: getMechanics,
        getCategories: getCategories,
        reset: reset,
        createGuestIndex: createGuestIndex,
        isGameInGroup: isGameInGroup,
    }

}




