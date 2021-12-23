'use strict'

const express = require('express');
const path = require('path');

module.exports = function (services) {
    const fileOptions = {
		root: path.join(__dirname, 'views'),
		dotfiles: 'deny'
	};

	function getHomepage(req, res) {
		res.sendFile('home.html', fileOptions);
	} 


	const router = express.Router()

	// Homepage
	router.get('/', getHomepage);
	return router
}

