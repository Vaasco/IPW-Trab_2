const services_builder = require('../borga-services.js');
const config = require("../borga-config.js")
const test_data_int = require('../borga-data-mem.js')(config.guest);


const test_user = 'costakilapada'
const test_token = 'abd331d7-fd48-4054-9b73-7b7edf2941a6';
const test_group = 'testGroup'
const test_description = "Test group."

const services = services_builder(undefined, test_data_int)

async function createTestGroup(){
    const returnValue = await services.createNewGroup(test_group, test_description, test_token)
    return returnValue
}

describe('Tests with data_mem', () => {

    afterEach(async () => {
        await test_data_int.reset();
    });
    
    test("Create new group", async () => {
        
        const groupRes = await createTestGroup()
        const group = groupRes.groupObject


        expect(groupRes.success).toBe(true)
        expect(group.name).toEqual(test_group)
        expect(group.description).toEqual(test_description)
        expect(!isNaN(group.id)).toBe(true)
        
        
        try{
            await services.createNewGroup(undefined, "teste", test_token)
        }catch(err){
            console.log(err)
            expect(err.name).toEqual("MISSING_PARAM")
        }

        try{
            await services.createNewGroup(test_group, "teste", test_token)
        }catch(err){
            console.log(err)
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.createNewGroup(test_group, "teste", undefined)
        }catch(err){
            console.log(err)
            expect(err.name).toEqual("UNAUTHENTICATED")
        }

    });
    
    test("Edit group", async () => {

        // Edit group Success 
        const groupCreated = await createTestGroup()
        const groupID = groupCreated.groupObject.id
        const newGroupName = "newName"
        const newDescription = "new Description"
        const groupResponse = await services.editMyGroup(groupID, newGroupName, newDescription, test_token)
        
        expect(groupResponse.groupObject).toEqual({
               name: newGroupName,
               description: newDescription,
        })
        expect(groupResponse.success).toBe(true)
        
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
        const groupResponse = await services.getMyGroups(test_token)
        
        groupResponse.groups[0].id = "123"

        expect(groupResponse).toEqual({
            groups: [
                {
                    name: test_group,
                    description: "Test group.",
                    games: [],
                    id: "123"
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
        const groupCreated = await createTestGroup()
        const groupID = groupCreated.groupObject.id
        const groupRes = await services.deleteGroup(groupID, test_token)
        expect(groupRes.groupObject).toEqual({
            "name": "testGroup"
        })
        expect(groupRes.success).toBe(true)

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
        const createdGroup = await createTestGroup()
        const groupID = createdGroup.groupObject.id
        const groupDetails = await services.groupDetails(groupID, test_token)
        expect(groupDetails).toEqual(groupDetails)
        
        
        try{
            await services.groupDetails("invalidname", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }

        try{
            await services.groupDetails(groupID, undefined)
        }catch(err){
            expect(err.name).toEqual("UNAUTHENTICATED")
        }

    });

    test("Remove a game from a group", async () => {
        const groupCreated = await createTestGroup()
        const groupID = groupCreated.groupObject.id
        const gameID = "6FmFeux5xH"

        const game = {
            "id": "6FmFeux5xH",
            "url": "https://www.boardgameatlas.com/game/6FmFeux5xH/pandemic",
            "name": "Pandemic",
            "price": "20.97",
            "min_players": 2,
            "max_players": 4,
            "min_age": 8,
            "description": " After five years of Pandemic, hundreds of thousands of players have contracted the virus! To celebrate this milestone, Pandemic has been completely re-designed. With new artwork by Chris Quilliams (Clash of Cultures, Merchants & Marauders), Pandemic will now have a more modern look, inside and outside the box. With two new characters (the Contingency Planner and the Quarantine Specialist) face the game in ways you never thought possible as brand-new, virulent challenges await you! \r\n In   Pandemic  , several virulent diseases have broken out simultaneously all over the world! The players are disease-fighting specialists whose mission is to treat disease hotspots while researching cures for each of four plagues before they get out of hand. \r\n The game board depicts several major population centers on Earth. On each turn, a player can use up to four actions to travel between cities, treat infected populaces, discover a cure, or build a research station. A deck of cards provides the players with these abilities, but sprinkled throughout this deck are  Epidemic!  cards that accelerate and intensify the diseases' activity. A second, separate deck of cards controls the \"normal\" spread of the infections. \r\n Taking a unique role within the team, players must plan their strategy to mesh with their specialists' strengths in order to conquer the diseases. For example, the Operations Expert can build research stations which are needed to find cures for the diseases and which allow for greater mobility between cities; the Scientist needs only four cards of a particular disease to cure it instead of the normal five—but the diseases are spreading quickly and time is running out. If one or more diseases spreads beyond recovery or if too much time elapses, the players all lose. If they cure the four diseases, they all win! \r\n The 2013 edition of  Pandemic  includes two new characters—the Contingency Planner and the Quarantine Specialist—not available in earlier editions of the game. \r\n Artists: \r\n Joshua Cappel (graphics and illustration) \r\n Régis Moulun (cover painting) \r\n Chris Quilliams (2013 edition)    ",
            "image_url": "https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1559254186140-51iNoyxoamL.jpg",
            "rules_url": "https://images-cdn.zmangames.com/us-east-1/filer_public/25/12/251252dd-1338-4f78-b90d-afe073c72363/zm7101_pandemic_rules.pdf",
            "amazon_rank": 316,
            "official_url": "https://www.zmangames.com/en/products/pandemic?utm_source=boardgameatlas.com&utm_medium=search&utm_campaign=bga_ads",
            "borga_rank": 8
        }

        await test_data_int.addGameToCollection(game)
        
        await test_data_int.addGameToGroup(groupID, gameID, test_user)
     
        const groupRes = await services.deleteGameByID(groupID, gameID, test_token)
        expect(groupRes.responseObject).toEqual({
            "groupName": "testGroup",
            "gameName": "Pandemic"
        })
        expect(groupRes.success).toBe(true)

        
        
        try{
            await services.deleteGameByID("invalidgroup", gameID, test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
        
        try{
            await services.deleteGameByID(groupID, "invalidgame", test_token)
        }catch(err){
            expect(err.name).toEqual("INVALID_PARAM")
        }
        
        try{
            await services.deleteGameByID(groupID, gameID, undefined)
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