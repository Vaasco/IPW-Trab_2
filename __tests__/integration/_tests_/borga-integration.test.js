'use strict';

const { header } = require('express/lib/response');
const fetch   = require('node-fetch');
const request = require('supertest');

const config = require('../../../borga-config');
const server = require('../../../borga-server');

const es_spec = {
	url: config.devl_es_url,
	prefix: 'test'
};

const app_builder = server(es_spec, config.guest);
const app = app_builder.app

const putConfigs = (obj) => {
    return {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj, null, 4)
    } 
}

const guestUserUrl = `${es_spec.url}${es_spec.prefix}_tokens/_doc/${config.guest.token}`
const collectionIndex = `${es_spec.url}${es_spec.prefix}_collection`
const guestUserIndex = `${es_spec.url}${es_spec.prefix}_${config.guest.user}`
const tokensIndex = `${es_spec.url}${es_spec.prefix}_tokens`
const userCreated = "supertest"
const userCreatedIndex = `${es_spec.url}${es_spec.prefix}_${userCreated.toLowerCase()}`

test('Confirm database is running', async () => {
    const response = await fetch(`${es_spec.url}_cat/health`);
    expect(response.status).toBe(200);
});



describe('Integration tests', () => {

	async function allInCollection(games){
		const responsesSuccess = games.every(async (game) => {
			const  gameResponse = await request(app)
				.get(`/api/games/${game.id}`)

			return gameResponse.status === 200
		})
		return await responsesSuccess
	}

	beforeAll(() => {
		return app_builder.setup()
	});

    afterAll(async () => {
        const deleteMethod = { method: 'DELETE' }
        await fetch(tokensIndex, deleteMethod)
        await fetch(collectionIndex, deleteMethod)
        await fetch(guestUserIndex, deleteMethod)
		await fetch(userCreatedIndex, deleteMethod)
    });

	const headers = {
		accept:{
			name: "Accept",
			value: "application/json",
		},
		authorization:{
			name: "Authorization",
			value: `Bearer ${config.guest.token}`,
		},
		contentType:{
			name: "Content-Type",
			value: /json/
		} 
	}

	test('Confirm guest user is created', async () => {
		const response = await fetch(guestUserUrl)
		expect(response.status).toBe(200)
	});

	test('Register a new user', async() => {
		const response = await request(app)
			.post('/api/register')
			.send({
				userName: userCreated
			})
			.expect(headers.contentType.name, headers.contentType.value)
			
			expect(response.status).toBe(200) 
			expect(response.body.userName).toEqual(userCreated)
	})

    test('Get empty group list', async() =>{
        const response = await request(app)
			.get('/api/my/groups')
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.expect(headers.contentType.name, headers.contentType.value)

        expect(response.status).toBe(200) 
        expect(response.body).toBeTruthy()
        expect(response.body.groups).toEqual([])
    });

	/* ---------------------GROUP OPERATIONS ------------------------------*/

	let groupID; // Initialized when group is created, this is the group used in this set of tests

	test("Add a group", async () => {
		const addResponse = await request(app)
			.post('/api/my/groups')
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.send({
				groupName: "test",
				groupDescription: "test description"
			})
			.expect(headers.contentType.name, headers.contentType.value)

		expect(addResponse.status).toBe(200)
		expect(addResponse.body.success).toBeTruthy()
		expect(addResponse.body.groupObject.name).toEqual('test')
		expect(addResponse.body.groupObject.description).toEqual('test description')

		groupID = addResponse.body.groupObject.id
	})

	test("Get user's groups", async () => {
		const listResponse = await request(app)
			.get(`/api/my/groups/${groupID}`)
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.expect(headers.contentType.name, headers.contentType.value)
	
		expect(listResponse.status).toBe(200)	
		expect(listResponse.body.group.name).toEqual('test')
		expect(listResponse.body.group.description).toEqual('test description')
		expect(listResponse.body.group.games).toEqual([])
	})

	test("Edit a group", async () => {
		const editResponse = await request(app)
			.put('/api/my/groups/edit')
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.send({
				id: groupID,
				newGroupName: "editedGroup",
				newDescription: "editedGroup description"
			})
			.expect(headers.contentType.name, headers.contentType.value)

		expect(editResponse.status).toBe(200)
		expect(editResponse.body.success).toBeTruthy()		
		expect(editResponse.body.groupObject.name).toEqual('editedGroup')
		expect(editResponse.body.groupObject.description).toEqual('editedGroup description')
	})

	/* ------------------------ UNAUTHENTICATED OPERATIONS ------------------------------- */

	test("Browse popular games", async () => {

		const popularGamesResponse = await request(app)
			.get('/api/global/popular')
			.set(headers.accept.name, headers.accept.value)
			.expect(headers.contentType.name, headers.contentType.value)

		
		const games = popularGamesResponse.body.games
		
		expect(popularGamesResponse.status).toBe(200)
		expect(games).toBeTruthy()
		expect(games.length).toBe(10)
		expect(games.every((game) => !!game)).toBeTruthy()
		
		const allInDb = await allInCollection(games)
		expect(allInDb).toBeTruthy()
		
	});
	
	let gameTest; // Initialized when we search for it's name, so the following tests use a game that exists in external services

	test('Search Pandemic Game', async() => {
		const gameName = 'Pandemic'
		
		const searchResponse = await request(app)
			.get(`/api/global/game/${gameName}`)
			.set(headers.accept.name, headers.accept.value)
			.expect(headers.contentType.name, headers.contentType.value)

		const games = searchResponse.body.games
		
		expect(searchResponse.status).toBe(200)
		expect(games.every((game) => !!game)).toBeTruthy()
		const allInDb = await allInCollection(games)
		expect(allInDb).toBeTruthy()

		gameTest = games[0]
	})

	/* -------------------------- GAME OPERATIONS -----------------------*/

	let gameID;

	test("Add game to a group", async() => {

		gameID = gameTest.id

		const addGameResponse = await request(app)
			.post('/api/my/groups/game')
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.send({	
				groupID: groupID,
				gameID: gameID			
			})
			.expect(headers.contentType.name, headers.contentType.value)
				
		expect(addGameResponse.status).toBe(200)
		expect(addGameResponse.body.success).toBeTruthy()	
		expect(addGameResponse.body.responseObject.groupName).toEqual('editedGroup')
		expect(addGameResponse.body.responseObject.gameName).toEqual(gameTest.name)
	})

	test("Delete game from group", async() =>{

		const deleteGameResponse = await request(app)
			.delete(`/api/my/groups/${groupID}/${gameID}`)	
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.expect(headers.contentType.name, headers.contentType.value)	
		
		expect(deleteGameResponse.status).toBe(200)
		expect(deleteGameResponse.body.success).toBeTruthy()
		expect(deleteGameResponse.body.responseObject.groupName).toEqual('editedGroup')
		expect(deleteGameResponse.body.responseObject.gameName).toEqual(gameTest.name)
	});

	// Delete group after game operations so it can be used in them

	test("Delete a group", async() =>{
		const deleteResponse = await request(app)
			.delete(`/api/my/groups/${groupID}`)
			.set(headers.authorization.name, headers.authorization.value)
			.set(headers.accept.name, headers.accept.value)
			.expect(headers.contentType.name, headers.contentType.value)
				
		expect(deleteResponse.status).toBe(200)	
		expect(deleteResponse.body.success).toBeTruthy()	
		expect(deleteResponse.body.groupObject.name).toEqual('editedGroup')				
    });
	
})
