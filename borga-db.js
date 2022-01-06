

'use strict'

/**Dependecies.*/
const crypto = require('crypto')
const errors = require('./borga-errors.js');
const fetch = require('node-fetch');

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

    const collectionUrl = `${baseUrl}${es_spec.prefix}_collection`

    function gameUrl(gameID){
        return `${collectionUrl}/_doc/${gameID}`
    }

    const tokensUrl = `${baseUrl}${es_spec.prefix}_tokens`

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
                putConfigs({userName: guest.user})
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
     * @returns true if the new user was created succesfully.
     */
    async function createNewUser(name){
       try{
        const userExists = await hasUser(name)
        if(userExists) return {success: false}
        const token = crypto.randomUUID()
        const response = await fetch(
            `${tokensUrl}/_doc/${token}`,
            putConfigs({userName: name})
        )
        return {success: success(response.status), token}
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
            const tokens = tokensResponse.hits.hits
            return tokens.some((obj) => {
                obj.userName === name
            })
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
                `${userUrl(userName)}/_doc/${groupGeneratedId}`,
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
            const newName = givenName || groupToEdit.groupName
            groupToEdit.name = newName
            groupToEdit.description = newDesc
            const response = fetch(
                `${userUrl(userName)}/_doc/${groupID}`,
                 putDetails(groupToEdit)
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
                `${userUrl(userName)}/_doc/${groupID}`,
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
                `${userUrl(userName)}/_doc/${groupID}`,
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
                `${userUrl(userName)}/_doc/${groupID}`,
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
            await fetch(
                collectionUrl
                ,{method: "DELETE"}
            )

            await fetch(userUrl(guest.user), {method: 'DELETE'})
            await fetch(tokensUrl, {method:"DELETE"})
        }catch(err){
            dbError(err)
        }
    }

    async function saveInfo(info, infoName){
        try{
            const response = await fetch(
                `${collectionUrl}/_doc/${infoName}?refresh=wait_for`,
                 putConfigs({info})
            )
            return success(response.status)
        }catch(err){
            dbError(err)
        }
    }

    async function saveMechanics(mechanics){
        return (await saveInfo(mechanics, "mechanics"))
    }

    async function saveCategories(categories){
        return (await saveInfo(categories, "categories"))
    }

    async function getInfoNames(gameID, infoName){
       try{
        const response = await fetch(
            `${collectionUrl}/_doc/${infoName}`
        )
        const infoResponse = await response.json()
        const info = infoResponse._source.info   
        const infoNames = await infoIDstoNames(gameID, info, infoName)
        return infoNames
       }catch(err){
            dbError(err)
       }
    }

    async function infoIDstoNames(gameId, info, infoName){
        try{ 
            const game = await getGame(gameId)
            
            const infoIDs = game[infoName].map((obj) => obj.id)
            const gameInfoSet = new Set(infoIDs)
            const gameInfoObjects = info.filter(
                (infoElem) => gameInfoSet.has(infoElem.id)
            )
            return gameInfoObjects.map((elem) => elem.name) 
        }catch(err){
            dbError(err)
        } 
    }

    async function getMechanics(gameID){
        return await getInfoNames(gameID, "mechanics")
    }

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
        getGame: getGame,
        addGameToCollection: addGameToCollection,
        addGameToGroup: addGameToGroup,
        deleteGameFromGroup: deleteGameFromGroup,
        createNewUser: createNewUser,
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




