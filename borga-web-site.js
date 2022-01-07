'use strict'

const express = require('express');
const path = require('path');

module.exports = function (services, guest_token) {

	function getToken(){
		return guest_token 
	}

	function getHomepage(req, res) {
		res.render('home');
	} 

	function onError(res, error){
		res.render("errors", { error })
	}

	async function findInBorgaGames(req, res){
		const header = 'Find Game Result'
		const gameName = req.query.game
		try{
			const gameRes = await services.getGameWithName(gameName)
			res.render('games_list', {header, gameName, games: gameRes.games, allowSave: true})
		}catch(err){
			onError(res, err)
		}
		
	}
	
	async function getGroups(req, res){
		try{
			const groupResponse = await services.getMyGroups(getToken())
			const groups = groupResponse.groups
			const noGroups = !groups.length ? 'No Groups Added' : undefined
			res.render('groups', {groups, noGroups})
				
		}catch(err){
			onError(res, err)
		}	
	}

	async function createGroup(req, res){
		try{
			await services.createNewGroup(req.body.groupName, req.body.groupDescription, getToken())
			res.redirect('/groups')
		}catch(err){
			onError(res, err)
		}
	}

	async function getGroupSelect(req, res){
		try{
			const groupResponse = await services.getMyGroups(getToken())
			const groups = groupResponse.groups
			if(!groups.length){
				res.redirect("/groups")
			}else{
				const gameID = req.body.gameID
				res.render('group_select', {groups, gameID})
			}
		}catch(err){
			onError(res, err)
		}
	}

	async function saveGame(req,res){
		try{
			const groupID = req.body.groupSelected
			const gameID = req.body.gameID
			await services.addGameToGroup(groupID, gameID, getToken())
			res.redirect("/groups")
		}catch(err){
			onError(res, err)
		}
	}

	async function getMyGroupDetails(req,res){
		try{
			const groupID = req.params.groupID
			const detailsResponse = await services.groupDetails(groupID, getToken())
			const group = detailsResponse.group
			res.render("group_details", {group})
		}catch(err){
			onError(res, err)
		}
	}

	async function getGameDetails(req, res){
		try{
			const gameID = req.params.gameID
			const detailsResponse = await services.getGameDetails(gameID, getToken())
			const game = detailsResponse.game
			res.render('game_details', {game})
		}catch(err){
			onError(res, err)
		}
	}

	async function getMostPopular(req, res){
		const header = 'Most Popular Games'
		try{
			const popular = await services.getPopularGames()
			const games = popular.games
			res.render('games_list', {header, games})
		}catch(err){
			onError(res, err)
		}
	}

	const router = express.Router()

	router.use(require('body-parser').urlencoded({ extended: true }));

	// Homepage
	router.get('/', getHomepage);

	// Search page	

	router.get('/game', findInBorgaGames)
	router.post('/game', saveGame)

	router.get('/groups', getGroups)
	router.post('/groups', createGroup)

	router.get('/groups/:groupID', getMyGroupDetails)

	router.post('/group-select', getGroupSelect)

	router.get('/games/:gameID', getGameDetails)

	router.get('/global/popular', getMostPopular)

	return router
}

