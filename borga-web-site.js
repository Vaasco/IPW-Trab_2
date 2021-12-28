'use strict'

const express = require('express');
const path = require('path');

module.exports = function (services, guest_token) {

	function getToken(req){
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
		}
		
	}
	const router = express.Router()

	// Homepage
	router.get('/', getHomepage);

	// Search page
	router.get('/search', getSearchPage);	

	router.get('/game', findInBorgaGames)
	
	return router
}

