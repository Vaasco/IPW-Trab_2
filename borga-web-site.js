'use strict'

const express = require('express');
const path  = require('path')

module.exports = function (services) {

	function getToken(req){
		if(req.user) return req.user.token
	}

	function isLoggedIn(req){
		return req.isAuthenticated()
	}


	function getHomepage(req, res) {
		const isLogged = isLoggedIn(req)
		const userName = isLogged ? req.user.userName : ""
		res.render('home', {userName, isLoggedIn: isLogged});
	}
	
	function getLoginPage(req, res){
		res.render('login', {isLoggedIn: isLoggedIn(req)})
	}

	function getRegisterPage(req, res){
		res.render('register', {isLoggedIn: isLoggedIn(req)})
	}

	async function doLogin(req, res) {
		try {
			const username = req.body.username;
			const password = req.body.password; 
			const user = await services.validateAndGetUser(username, password)
			req.login({ userName: user.userName, token: user.token }, err => {
				if (err) {
					onError(req, res, err)
				}
				res.redirect("/");
			});
		} catch (err) {
			onError(req, res, err)
		}
	} 

	async function doLogout(req,res){
		req.logout()
		res.redirect('/')
	}

	async function doRegister(req,res){
		try{
			const username = req.body.userName;
			const password = req.body.password;
			await services.createNewUser(username,password)
			res.redirect('/login')
		}catch(err){
			onError(req, res, err)
		}
	}

	function onError(req, res, error){
		res.render("errors", { error , isLoggedIn: isLoggedIn(req)})
	}

	async function findInBorgaGames(req, res){
		const header = 'Find Game Result'
		const gameName = req.query.game
		try{
			const gameRes = await services.searchGameByName(gameName)
			res.render('games_list', {header, gameName, games: gameRes.games, isLoggedIn: isLoggedIn(req)})
		}catch(err){
			onError(req, res, err)
		}
		
	}
	
	async function getGroups(req, res){
		try{
			const groupResponse = await services.getMyGroups(getToken(req))
			const groups = groupResponse.groups
			const noGroups = !groups.length ? 'No Groups Added' : undefined
			res.render('groups', {groups, noGroups, isLoggedIn: isLoggedIn(req)})
				
		}catch(err){
			onError(req, res, err)
		}	
	}

	async function createGroup(req, res){
		try{
			await services.createNewGroup(req.body.groupName, req.body.groupDescription, getToken(req))
			res.redirect("/groups")
		}catch(err){
			onError(req, res, err)
		}
	}

	async function getGroupSelect(req, res){
		try{
			const groupResponse = await services.getMyGroups(getToken(req))
			const groups = groupResponse.groups
			if(!groups.length){
				res.redirect("/groups")
			}else{
				const gameID = req.body.gameID
				res.render('group_select', {groups, gameID, isLoggedIn: isLoggedIn(req)})
			}
		}catch(err){
			onError(req, res, err)
		}
	}

	async function saveGame(req,res){
		try{
			const groupID = req.body.groupSelected
			const gameID = req.params.gameID
			await services.addGameToGroup(groupID, gameID, getToken(req))
			res.redirect("/groups")
		}catch(err){
			onError(req, res, err)
		}
	}

	async function getMyGroupDetails(req,res){
		try{
			const groupID = req.params.groupID
			const detailsResponse = await services.groupDetails(groupID, getToken(req))
			const group = detailsResponse.group
			res.render("group_details", {group, groupID: group.id, isLoggedIn: isLoggedIn(req)})
		}catch(err){
			onError(req, res, err)
		}
	}

	async function getGameDetails(req, res){
		try{
			const gameID = req.params.gameID
			const detailsResponse = await services.getGameDetails(gameID, getToken(req))
			const game = detailsResponse.game
			res.render('game_details', {game, isLoggedIn: isLoggedIn(req)})
		}catch(err){
			onError(req, res, err)
		}
	}

	async function getMostPopular(req, res){
		const header = 'Most Popular Games'
		try{
			const popular = await services.getPopularGames()
			const games = popular.games
			res.render('games_list', {header, games, isLoggedIn: isLoggedIn(req)})
		}catch(err){
			onError(req, res, err)
		}
	}

	

	async function getGroupEdition(req, res){
		try {
			res.render('group_edition', {groupID: req.params.groupID, isLoggedIn: isLoggedIn(req)})
		} catch (error) {
			onError(req, res, err)
		}
	}

	const router = express.Router()

	router.use(require('body-parser').urlencoded({ extended: false }));

	// Homepage
	router.get('/', getHomepage);

	// Login action
	router.get('/login', getLoginPage)
	router.post('/login', doLogin);
	
	// Logout action
	router.post('/logout', doLogout);

	router.get('/register', getRegisterPage)
	router.post('/register', doRegister);

	// Search page	
	router.get('/games', findInBorgaGames) // DONE
	router.get('/popular', getMostPopular) // DONE
	router.get('/groups', getGroups) // DONE
	router.post('/groups', createGroup) // DONE
	
	router.get('/games/:gameID', getGameDetails) // DONE
	
	router.post('/groups/selection', getGroupSelect) // DONE
	router.post('/groups/:gameID', saveGame) // DONE
	
	router.get('/groups/:groupID', getMyGroupDetails) // DONE

	router.get('/groups/edition/:groupID', getGroupEdition) // DONE

	return router
}

