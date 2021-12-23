const services_builder = require('../borga-services.js');

const test_data_int = require('../borga-data-mem.js');


const test_user = 'costakilapada'
const test_token = 'abd331d7-fd48-4054-9b73-7b7edf2941a6';
const test_group = 'testGroup'

const services = services_builder(undefined, test_data_int)

async function createTestGroup(){
    const name = test_group
    const description = "Test group."
    return await services.createNewGroup(name, description, test_token)
}

describe('Tests with data_mem', () => {

    afterEach(async () => {
        await test_data_int.reset();
    });
    
    test("Create new group", async () => {
        
        const group = await createTestGroup()
        expect(group).toEqual({
            "group": {
               name: test_group,
               description: "Test group.",
                gameNames: []
            }
        })

        try{
            await services.createNewGroup(undefined, "teste", test_token)
        }catch(err){
            expect(err.name).toEqual("MISSING_PARAM")
        }

        try{
            await services.createNewGroup(test_group, "teste", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.createNewGroup(test_group, "teste", undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }

    });
    
    test("Edit group", async () => {

        // Edit group Success 
        const groupCreated = await createTestGroup()
        const groupID = groupCreated.id
        const newGroupName = "newName"
        const newDescription = "new Description"
        const group = await services.editMyGroup(groupID, newGroupName, newDescription, test_token)
        
        expect(group).toEqual({
            "group": {
               name: "newName",
               description: "new Description",
               gameNames: []
            }
        })
        
        try{
            await services.editMyGroup(undefined, newGroupName, newDescription, test_token)
        }catch(err){
            expect(err.name).toEqual("MISSING_PARAM")
        }

        try{
            await services.editMyGroup(test_group, undefined, undefined, test_token)
        }catch(err){
            expect(err.name).toEqual("MISSING_PARAM")
        }

        try{
            await services.editMyGroup("invalidname", newGroupName, newDescription, test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.editMyGroup(groupID, newGroupName, newDescription, undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }
    });

    test("List all groups", async () => {
        await createTestGroup()
        services.getMyGroups()
        
        const group = await services.getMyGroups(test_token)
        
        expect(group).toEqual({
            groups: [
                {
                    name: test_group,
                    description: "Test group.",
                    gameNames: []
                }
            ]
        })
        
        try{
            await services.getMyGroups(undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }

        
    });

    test("Delete group", async () => {
        await createTestGroup()
        const group = await services.deleteGroup(groupID, test_token)
        expect(group).toEqual({
            "groupName": "testGroup"
        })

        try{
            await services.deleteGroup("invalidname", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.deleteGroup(groupID, undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }
    });

    test("Get Details of a group", async () => {
        await createTestGroup()
        const groupDetails = await services.getDetails(groupID, test_token)
        expect(groupDetails).toEqual(groupDetails)
        
        
        try{
            await services.getDetails("invalidname", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.getDetails(groupID, undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }

    });

    test("Remove a game from a group", async () => {
        const groupRes = await createTestGroup()
        const groupName = groupRes.group.name
        await test_data_int.addGameToGroup(groupID, gameName, test_user)
        const gameNameRes = await services.deleteGameByName(groupID, gameName, test_token)
        expect(gameNameRes.gameName).toEqual(gameName)
        
        
        try{
            await services.deleteGameByName("invalidgroup", gameName, test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
        
        try{
            await services.deleteGameByName(groupID, "invalidgame", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
        
        try{
            await services.deleteGameByName(groupID, gameName, undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }
    });

    test("Remove a game from a group", async () => {
        const groupRes = await createTestGroup()
        const groupName = groupRes.group.name
        await test_data_int.addGameToGroup(groupID, gameName, test_user)
        const gameNameRes = await services.deleteGameByName(groupID, gameName, test_token)
        expect(gameNameRes.gameName).toEqual(gameName)
        
        
        try{
            await services.deleteGameByName("invalidgroup", gameName, test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
        
        try{
            await services.deleteGameByName(groupID, "invalidgame", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
        
        try{
            await services.deleteGameByName(groupID, gameName, undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }
    });
    
    test("Create new user", async () => {
        
        const userCreatedRes = await services.createNewUser("kilapada")
        expect(userCreatedRes.userName).toEqual("kilapada")
        expect(userCreatedRes.token).toBeDefined()
        
        try{
            await services.createNewUser(undefined)
        }catch(err){
            expect(err.name).toEqual("MISSING_PARAM")
        }

        try{
            await services.createNewUser("ul3")
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.createNewUser("userwithmorethansixteencaracters")
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
    });

});