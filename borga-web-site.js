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

	function getSearchPage(req, res) {
		res.render('search');
	} 

	async function findInBorgaGames(req, res){
		const header = 'Find Game Result'
		const gameName = req.query.game
		try{
			const gameRes = await services.getGameWithName(gameName)
			res.render('search_games', {header, gameName, games: gameRes.games, allowSave: true})
		}catch(err){
			console.log(err)
		}
		
	}

	async function getGroups(req, res){
		try{
			const groupResponse = await services.getMyGroups(getToken())
			const groups = groupResponse.groups
			const noGroups = !groups.length ? 'No Groups Added' : undefined
			res.render('groups', {groups, noGroups})
				
		}catch(err){
			console.log(err)
		}	
	}

	async function createGroup(req, res){
		try{
			await services.createNewGroup(req.body.groupName, req.body.groupDescription, getToken())
			res.redirect('/groups')
		}catch(err){
			console.log(err)
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
			console.log(err)
		}
	}

	async function saveGame(req,res){
		try{
			const groupID = req.body.groupSelected
			const gameID = req.body.gameID
			await services.addGameToGroup(groupID, gameID, getToken())
			res.redirect("/groups")
		}catch(err){
			console.log(err)
		}
	}

	async function getMyGroupDetails(req,res){
		try{
			const groupID = req.params.groupID
			const detailsResponse = await services.groupDetails(groupID, getToken())
			const group = detailsResponse.group
			console.log(group)
			res.render("group_details", {group})
		}catch(err){
			console.log(err)
		}
	}

	const router = express.Router()

	router.use(require('body-parser').urlencoded({ extended: true }));

	// Homepage
	router.get('/', getHomepage);

	// Search page
	router.get('/search', getSearchPage)	

	router.get('/game', findInBorgaGames)
	router.post('/game', saveGame)

	router.get('/groups', getGroups)
	router.post('/groups', createGroup)

	router.get('/groups/:groupID', getMyGroupDetails)

	router.post('/group-select', getGroupSelect)

	return router
}

